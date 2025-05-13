# 图形化启动
# 打包：将Core.py内容全部复制到此处并删除第四行import
# pyinstaller --onefile --windowed --hidden-import PyQt5.sip GUI.py
from Core import *
import webbrowser
from PyQt5.QtWidgets import (
    QApplication,
    QMainWindow,
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QLineEdit,
    QPushButton,
    QCheckBox,
    QTabWidget,
    QListWidget,
    QListWidgetItem,
    QLabel,
    QProgressBar,
    QMessageBox,
    QTextBrowser,
)
from PyQt5.QtCore import Qt, pyqtSignal, QObject, QTimer
from PyQt5.QtGui import QFont, QColor, QFontDatabase


class SearchSignal(QObject):
    update_tab = pyqtSignal(str, str, list)  # 平台名称，颜色，结果列表
    complete = pyqtSignal()
    progress = pyqtSignal(int)


class GalSearchGUI(QMainWindow):
    def __init__(self):
        super().__init__()
        self.search_executor = ThreadPoolExecutor(max_workers=10)
        self.signals = SearchSignal()
        self.platforms = searchGUI
        self.init_ui()
        self.setup_connections()

    def init_ui(self):
        self.setWindowTitle("Galgame聚合搜索工具 - 支持多平台并发搜索")
        self.setGeometry(100, 100, 1280, 800)
        self.setStyleSheet("""
            QMainWindow {
                background-color: #2D2D2D;
            }
            QLabel {
                color: #E0E0E0;
                font-size: 14px;
            }
            QLineEdit {
                background: #404040;
                color: #FFFFFF;
                border: 2px solid #4A9C82;
                border-radius: 5px;
                padding: 8px;
                font-size: 14px;
            }
            QPushButton {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #4A9C82, stop:1 #3D816D);
                color: white;
                border-radius: 5px;
                padding: 10px;
                min-width: 100px;
                font-size: 14px;
            }
            QPushButton:hover {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #5BB697, stop:1 #4A9C82);
            }
            QCheckBox {
                color: #E0E0E0;
                font-size: 14px;
            }
            QTabWidget::pane {
                border: 2px solid #4A9C82;
                background: #353535;
            }
            QTabBar::tab {
                background: #404040;
                color: #E0E0E0;
                padding: 12px 24px;
                border: 1px solid #606060;
                border-bottom: none;
                border-top-left-radius: 5px;
                border-top-right-radius: 5px;
                min-width: 120px;
            }
            QTabBar::tab:selected {
                background: #4A9C82;
                color: white;
            }
            QListWidget {
                background: #404040;
                color: #E0E0E0;
                border: none;
                outline: none;
                font-size: 14px;
            }
            QProgressBar {
                border: 2px solid #4A9C82;
                border-radius: 5px;
                text-align: center;
                background: #404040;
            }
            QProgressBar::chunk {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #4A9C82, stop:1 #3D816D);
            }
        """)

        # 主控件
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        layout = QVBoxLayout(main_widget)

        # 搜索栏
        search_bar = QWidget()
        search_layout = QHBoxLayout(search_bar)
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("输入游戏名称（支持中日文）")
        self.search_btn = QPushButton("🚀 开始搜索")
        self.magic_check = QCheckBox("启用魔法搜索（访问海外站点）")
        search_layout.addWidget(self.search_input, 4)
        search_layout.addWidget(self.search_btn, 1)
        search_layout.addWidget(self.magic_check, 2)

        # 进度条
        self.progress_bar = QProgressBar()
        self.progress_bar.setRange(0, 100)
        self.progress_bar.setFormat("等待搜索...")

        # 结果标签页
        self.tabs = QTabWidget()
        self.tabs.setTabPosition(QTabWidget.North)
        self.tabs.setElideMode(Qt.ElideRight)

        layout.addWidget(search_bar)
        layout.addWidget(self.progress_bar)
        layout.addSpacing(10)  # 调整数值(如20)，以增加或减少间距
        layout.addWidget(self.tabs)

    def setup_connections(self):
        self.search_btn.clicked.connect(self.start_search)
        self.signals.update_tab.connect(self.update_result_tab)
        self.signals.complete.connect(self.search_complete)
        self.signals.progress.connect(self.update_progress)

    def start_search(self):
        # 清除旧结果
        self.tabs.clear()
        self.progress_bar.setFormat("搜索进行中...")

        # 过滤平台
        use_magic = self.magic_check.isChecked()
        active_platforms = [p for p in self.platforms if p[2] <= use_magic]

        # 初始化进度
        self.progress_bar.setValue(0)
        self.progress_bar.setMaximum(len(active_platforms))

        # 开始搜索
        for platform in active_platforms:
            self.search_executor.submit(self.run_search, platform)

    def run_search(self, platform):
        func, color, _ = platform
        try:
            game = self.search_input.text()
            result = func(game)
            items = [f"{res['name']}||{res['url']}" for res in result[0]]
            self.signals.update_tab.emit(result[2], color, items)
        except Exception as e:
            print(f"Search error: {str(e)}")
        finally:
            self.signals.progress.emit(1)

    def update_result_tab(self, platform_name, color, items):
        tab = QWidget()
        layout = QVBoxLayout(tab)

        # 平台标题
        title = QLabel(
            f"「<span style='color:{color}'>{platform_name}</span>」找到 {len(items)} 个结果"
        )
        title.setStyleSheet("font-size: 16px;")
        title.setTextFormat(Qt.RichText)
        layout.addWidget(title)

        # 结果列表
        list_widget = QListWidget()
        for item in items:
            list_item = QListWidgetItem()
            widget = QWidget()
            main_layout = QHBoxLayout(widget)

            # 文本区域
            text_widget = QWidget()
            text_layout = QVBoxLayout(text_widget)
            text_layout.setContentsMargins(0, 0, 0, 0)

            # 游戏名称（可选中）
            name, url = item.split("||")
            name_edit = QTextBrowser()
            name_edit.setPlainText(name)
            name_edit.setStyleSheet("""
                QTextBrowser {
                    color: #E0E0E0;
                    background: transparent;
                    border: none;
                    font-size: 14px;
                    padding: 0;
                }
            """)
            name_edit.setVerticalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
            name_edit.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
            name_edit.setFixedHeight(30)

            # URL显示（可选中）
            url_edit = QTextBrowser()
            url_edit.setPlainText(url)
            url_edit.setStyleSheet("""
                QTextBrowser {
                    color: #808080;
                    background: transparent;
                    border: none;
                    font-size: 12px;
                    padding: 0;
                }
            """)
            url_edit.setVerticalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
            url_edit.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
            url_edit.setFixedHeight(20)

            text_layout.addWidget(name_edit)
            text_layout.addWidget(url_edit)

            # 打开按钮
            btn = QPushButton("🌐 打开")
            btn.setStyleSheet("""
                QPushButton {
                    background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                        stop:0 #4A9C82, stop:1 #3D816D);
                    padding: 8px;
                    min-width: 80px;
                }
                QPushButton:hover {
                    background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                        stop:0 #5BB697, stop:1 #4A9C82);
                }
            """)
            btn.clicked.connect(lambda _, u=url: webbrowser.open(u))

            main_layout.addWidget(text_widget, 4)
            main_layout.addWidget(btn, 1)

            list_item.setSizeHint(widget.sizeHint())
            list_widget.addItem(list_item)
            list_widget.setItemWidget(list_item, widget)

        layout.addWidget(list_widget)

        # 添加标签页并设置颜色
        tab_index = self.tabs.addTab(tab, platform_name)
        tab_bar = self.tabs.tabBar()

        # 设置标签颜色（选中和未选中状态）
        tab_bar.setStyleSheet(f"""
            QTabBar::tab:selected {{
                color: #FFFFFF;
                border-color: #4A9C82;
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 #4A9C82, stop:1 #353535);
            }}
            QTabBar::tab:!selected {{
                color: #FFFFFF;
                background: #404040;
            }}
        """)

        # 强制刷新样式
        tab_bar.update()

    def update_progress(self, value):
        current = self.progress_bar.value() + value
        self.progress_bar.setValue(current)
        if current >= self.progress_bar.maximum():
            self.progress_bar.setFormat("搜索完成！")
        else:
            self.progress_bar.setFormat(
                f"进度：{current}/{self.progress_bar.maximum()}"
            )

    def search_complete(self):
        self.search_btn.setEnabled(True)


class SplashScreen(QMessageBox):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("欢迎使用聚合搜索工具")
        self.setIcon(QMessageBox.Information)
        self.setTextFormat(Qt.RichText)

        splash_text = """
        <html><body style='color:#E0E0E0; font-size:14px'>
        <h2 style='color:#4A9C82; text-align:center'>使用须知</h2>
        <center><small>Ver 2025/02/04 V2</small></center>
        <p>1. 本程序仅供学习交流使用，请支持正版游戏</p>
        <p>2. 本程序只用于搜索互联网平台上的内容，搜索结果来自第三方平台，请自行判断内容安全性</p>
        <p>3. 访问海外站点需要启用魔法搜索功能，自己配好魔法</p>
        <p>4. 如果搜索词过短，部分平台的结果可能搜索不全(截取第一页结果)，因此尽量精确游戏名搜索</p>
        <p>5. 本程序每获取到请求后都会关闭与服务器的连接，本程序不提倡爆破/恶意爬取数据</p>
        <p>6. 如果遇到某个平台搜索失败, 检查你是否开了魔法, 也可能是平台炸了或者正则失效了</p>
        <p style='color:#1FD700'>平台标签绿色免登录可下载，金色需要魔法，白色需一定条件才能下载(例如登录/回复等)</p>
        <p style='color:#FFD700'>收录的大多是提供PC平台资源的网站，大部分平台都提供Onedrive或直链，两种方式比国内网盘下载速度更快</p>
        <p style='color:#FF6969'>请关闭浏览器的广告拦截插件, 或将各gal网站添加到白名单, 各网站建站不易, 这是对这些网站最基本支持</p>
        <center><p style='color:#FF6969'>有能力者请支持Galgame正版！</p></center>
        </body></html>
        """

        self.setText(splash_text)
        self.setStandardButtons(QMessageBox.Ok)
        self.setStyleSheet("""
            QMessageBox {
                background-color: #353535;
                min-width: 500px;
            }
            QLabel {
                color: #E0E0E0;
                font-size: 14px;
            }
            QPushButton {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #4A9C82, stop:1 #3D816D);
                color: white;
                border-radius: 5px;
                padding: 8px;
                min-width: 80px;
            }
            QPushButton:hover {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #5BB697, stop:1 #4A9C82);
            }
        """)


if __name__ == "__main__":
    print("Galgame聚合搜索工具 - 支持多平台并发搜索")

    app = QApplication(sys.argv)
    app.setFont(QFont("Microsoft YaHei", 12))

    print("已经启动新的窗口用于显示搜索器的图形化界面")
    print("运行过程中请勿关闭该黑框窗口")

    # 先显示公告窗口
    splash = SplashScreen()
    splash.exec_()

    # 公告关闭后显示主窗口
    window = GalSearchGUI()
    window.show()
    sys.exit(app.exec_())
