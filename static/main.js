// 首次访问显示公告，带有动画效果
$(document).ready(function () {
  Swal.fire({
    title: "✨ 使用须知 ✨",
    html: `<div style="text-align: left; color: #eee;">
        <center><p style='color:#1FD700'>感谢 <a href='https://saop.cc/' target='_blank'>@Asuna</a> 大佬的服务器支撑与技术支持</p></center>
        <p>1. 本程序仅供学习交流使用，请支持正版游戏</p>
        <p>2. 本程序只用于搜索互联网平台上的内容，搜索结果来自第三方平台，请自行判断内容安全性</p>
        <p>3. 访问海外站点需要启用魔法搜索功能，请在服务端设置魔法(访客无需关注)</p>
        <p>4. 如果搜索词过短，部分平台的结果可能搜索不全(截取第一页结果)，因此尽量精确游戏名搜索</p>
        <p>5. 本程序每获取到请求后都会关闭与服务器的连接，本程序不提倡爆破/恶意爬取数据</p>
        <p>6. 如果遇到某个平台搜索失败, 检查你是否开了魔法, 也可能是平台炸了或者正则失效了</p>
        <p style='color:#1FD700'>平台标签绿色免登录可下载，金色需要魔法，白色需一定条件才能下载(例如登录/回复等)</p>
        <p style='color:#FFD700'>收录的大多是提供PC平台资源的网站，大部分平台都提供Onedrive或直链，两种方式比国内网盘下载速度更快</p>
        <p style='color:#FF6969'>请关闭浏览器的广告拦截插件, 或将各gal网站添加到白名单, 各网站建站不易, 这是对这些网站最基本支持</p>
        <center><p style='color:#FF6969'>有能力者请支持Galgame正版！</p></center>
        <center><small>觉得好用请前往 <a href="https://github.com/Jurangren/SearchGal" target="_blank">Github</a> 给项目点个免费的 Star 支持一下, 秋梨膏~!</small></center>
               </div>`,
    icon: "info",
    confirmButtonText: "我已了解并认同上述观点",
    background: "rgba(40,40,40,0.95)",
    confirmButtonColor: "#ff7eb9",
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      popup: "animate__animated animate__zoomIn",
    },
  });

  // 更新流式搜索按钮状态
  function updateStreamButton(isInitial) {
    const streamCheck = $("#streamCheck");
    const streamLabel = $("label[for='streamCheck']");
    const streamContainer = streamCheck.closest(".input-group-text");
    const patchText = $("#patch-text");
    const overlay = $("#page-transition-overlay");
    const transitionMessage = $("#transition-message");

    const showOverlay = (message) => {
      transitionMessage.text(message);
      overlay.addClass("visible");
    };

    const hideOverlay = () => {
      overlay.removeClass("visible");
    };

    const updateContent = () => {
      if (streamCheck.prop("checked")) {
        streamLabel.text("搜索游戏");
        streamContainer.css("background-color", "rgba(255, 0, 0, 0.5)");
        patchText.fadeOut(300);
      } else {
        streamLabel.text("搜索补丁");
        streamContainer.css("background-color", "rgba(0, 255, 0, 0.5)");
        patchText.fadeIn(300);
      }
    };

    if (isInitial) {
      // 初始化时，不显示遮罩，直接更新内容
      updateContent();
    } else {
      // 用户点击时，执行带动画的切换流程
      const message = streamCheck.prop("checked")
        ? "切换至 游戏搜索"
        : "切换至 补丁搜索";
      
      // 1. 显示遮罩和消息
      showOverlay(message);

      // 2. 等待遮罩动画完成 (400ms) + 短暂显示 (300ms)
      setTimeout(() => {
        // 3. 开始更新背景内容（按钮颜色和标题文字淡入淡出）
        updateContent();

        // 4. 等待内容更新动画完成 (300ms) 后，开始隐藏遮罩
        setTimeout(() => {
          hideOverlay();
        }, 300);
      }, 700);
    }
  }

  // 页面加载时初始化按钮状态
  updateStreamButton(true); // 传入true表示是初始化

  // 监听流式搜索开关的变化
  $("#streamCheck").on("change", function () {
    updateStreamButton(false); // 传入false表示是用户点击
  });
});

// 调整 url-box 的宽度（防止超出或折叠）
function adjustUrlBox() {
  $(".url-box").each(function () {
    const $this = $(this);
    const parent = $this.closest('div[style*="min-width: 0"]');
    if (!parent.length) return;
    const tempSpan = $("<span>")
      .text($this.text())
      .css({
        position: "absolute",
        visibility: "hidden",
        "white-space": "nowrap",
        font: $this.css("font"),
        padding: $this.css("padding"),
        "letter-spacing": $this.css("letter-spacing"),
      })
      .appendTo("body");
    const textWidth = tempSpan.outerWidth();
    const parentWidth = parent.width();
    tempSpan.remove();
    $this.css("max-width", textWidth < parentWidth ? textWidth : parentWidth);
  });
}
let resizeTimer;
$(window).on("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(adjustUrlBox, 100);
});
// const observer = new MutationObserver(mutations => {
//     adjustUrlBox();
//     setTimeout(adjustUrlBox, 50);
// });
// observer.observe(document.getElementById('results'), {
//     childList: true,
//     subtree: true
// });

function copyUrl(url) {
  const fallbackCopy = () => {
    const textarea = document.createElement("textarea");
    textarea.value = url;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      showCopySuccess();
    } catch (err) {
      showCopyError();
    } finally {
      document.body.removeChild(textarea);
    }
  };

  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        showCopySuccess();
      })
      .catch(() => {
        fallbackCopy();
      });
  } else {
    fallbackCopy();
  }
}

// 独立提示函数
function showCopySuccess() {
  Swal.fire({
    icon: "success",
    title: "复制成功",
    text: "链接已存入剪贴板",
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 1500,
    background: "rgba(0,255,0,0.9)",
    customClass: {
      popup: "animate__animated animate__fadeInDown",
    },
  });
}

function showCopyError() {
  Swal.fire({
    icon: "error",
    title: "复制失败",
    html: "请手动选择链接后按<kbd>Ctrl+C</kbd>复制",
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 3000,
    background: "rgba(255,0,0,0.9)",
  });
}

// 搜索函数
function doSearch() {
  const game = $("#gameInput").val().trim();
  if (!game) return;

  // 清空结果
  $("#platformNav").empty().addClass("d-none");
  $("#results").html(`
    <div class="col-12 text-center text-white py-4">
      <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
      <div class="mt-2 progress-text">正在搜索中...</div>
    </div>
  `);

  const formData = new FormData();
  formData.append("game", game);
  formData.append("magic", $("#magicCheck").prop("checked"));
  formData.append("stream", $("#streamCheck").prop("checked")); // 新增流式模式参数
  formData.append("zypassword", $("#zyPassword").val());

  // 根据流式模式选择请求方式
  const url = $("#streamCheck").prop("checked")
    ? "/search-gal"
    : "/search-patch";
  streamSearch(url, formData);
}

// 通用流式搜索函数
function streamSearch(url, formData) {
  fetch(url, {
    method: "POST",
    body: formData,
  })
    .then(async (response) => {
      if (response.status === 429) {
        const data = await response.json();
        Swal.fire({
          icon: "error",
          title: "请求过于频繁",
          text: data.error,
          toast: true,
          position: "top",
          showConfirmButton: false,
          timer: 3000,
          background: "rgba(255,0,0,0.9)",
          customClass: {
            popup: "animate__animated animate__fadeInDown",
          },
        });
        // 清理加载状态
        $("#results").empty();
        $(".progress-text").parent().hide();
        return;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let totalPlatforms = 0;

      const processChunk = ({ done, value }) => {
        if (done) {
          // 完成时隐藏进度条
          $(".progress-text").parent().hide();
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n");
        buffer = parts.pop();

        parts.forEach((part) => {
          if (!part.trim()) return;
          try {
            const data = JSON.parse(part);

            if (data.total) {
              totalPlatforms = data.total;
              $(".progress-text").text(`正在搜索中... (0/${totalPlatforms})`);
            } else if (data.progress) {
              $(".progress-text").text(
                `正在搜索中... (${data.progress.completed}/${data.progress.total})`
              );
              if (data.result) addResult(data.result);
            } else if (data.done) {
              $(".progress-text").parent().hide();
            }
          } catch (e) {
            console.error("解析错误:", e);
          }
        });

        return reader.read().then(processChunk);
      };
      adjustUrlBox()

      return reader.read().then(processChunk);
    })
    .catch((error) => {
      console.error("搜索请求失败:", error);
      Swal.fire("错误", "搜索失败，请检查网络连接或稍后重试", "error");
    });
}

function addResult(result) {
  const platformId = `platform-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  // 构建平台卡片
  const cardHtml = `
    <div class="col-12">
      <div id="${platformId}" class="platform-card" style="color: ${
    result.color
  };">
        <div class="card-header border-bottom-0" style="color: ${
          result.color
        };">
          <i class="fa-solid fa-diamond me-2"></i>${result.name}
          ${
            result.error
              ? '<span class="badge bg-danger float-end">错误</span>'
              : `<span class="badge bg-dark float-end">${result.items.length} 结果</span>`
          }
        </div>
        <div class="card-body py-2">
          ${
            result.error
              ? `
            <div class="result-item">
              <div class="d-flex justify-content-between align-items-center">
                <div style="min-width: 0;">
                  <h5 class="text-white mb-2">${result.error}</h5>
                </div>
              </div>
            </div>
          `
              : result.items
                  .map(
                    (item) => `
            <div class="result-item">
              <div class="d-flex justify-content-between align-items-center">
                <div style="min-width: 0;">
                  <h5 class="text-white mb-2">${item.name}</h5>
                  <div class="url-box" onclick="copyUrl('${item.url}')"
                        onmousedown="this.classList.add('url-box-active')"
                        onmouseup="this.classList.remove('url-box-active')"
                        style="cursor: pointer;">
                    <small class="text-muted">${item.url}</small>
                  </div>
                </div>
                <button class="btn btn-sm btn-outline-light ms-3"
                        onclick="window.open('${item.url}')"
                        style="flex-shrink: 0;">
                  <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </button>
              </div>
            </div>
          `
                  )
                  .join("")
          }
        </div>
      </div>
    </div>
  `;

  // 插入结果
  $("#results").append(cardHtml);

  // 更新导航栏
  const navLink = `<a href="#${platformId}" style="border: 1px solid ${result.color} !important;">${result.name}</a>`;
  $("#platformNav").append(navLink).removeClass("d-none");

  // 调整布局
  // adjustUrlBox();
}
// 监听输入框的回车键事件
$("#gameInput").on("keypress", function (event) {
  if (event.key === "Enter") {
    // 判断是否按下的是回车键
    event.preventDefault(); // 防止回车键引发默认行为（如表单提交）
    $(".search-btn").click(); // 模拟点击搜索按钮
  }
});

// Handle collapse icon toggling
$("#configCollapse").on("show.bs.collapse", function () {
  $(this)
    .prev(".d-flex")
    .find("i.fa-chevron-down")
    .removeClass("fa-chevron-down")
    .addClass("fa-chevron-up");
});

$("#configCollapse").on("hide.bs.collapse", function () {
  $(this)
    .prev(".d-flex")
    .find("i.fa-chevron-up")
    .removeClass("fa-chevron-up")
    .addClass("fa-chevron-down");
});

$("#commentsCollapse").on("show.bs.collapse", function () {
  $(this)
    .prev(".d-flex")
    .find("i.fa-chevron-down")
    .removeClass("fa-chevron-down")
    .addClass("fa-chevron-up");
});

$("#commentsCollapse").on("hide.bs.collapse", function () {
  $(this)
    .prev(".d-flex")
    .find("i.fa-chevron-up")
    .removeClass("fa-chevron-up")
    .addClass("fa-chevron-down");
});

let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if (isMobile) {
  $("#gameInput").attr("autocomplete", "off");
  window.addEventListener("resize", function () {
    if (document.activeElement.tagName === "INPUT") {
      window.scrollTo(0, 0);
    }
  });
}

// 初始化评论区
let artalkInitialized = false;
$("#commentsCollapse").on("shown.bs.collapse", function () {
  if (!artalkInitialized) {
    Artalk.init({
      el: "#Comments",
      pageKey: "https://searchgal.homes",
      server: "https://artalk.saop.cc",
      site: "Galgame 聚合搜索",
      darkMode: true,
    });
    artalkInitialized = true;
  }
});

