import type { Platform } from "../../types";
import ACGYingYingGuai from "./ACGYingYingGuai";
// import BiAnXingLu from "./BiAnXingLu"; // 已禁用：源站返回 521（Cloudflare 回源失败），站点已宕机，故停用
import DaoHeGal from "./DaoHeGal";
import FuFuACG from "./FuFuACG";
// import GGBases from "./GGBases"; // 已禁用：openresty WAF 按 searchgal UA 屏蔽，换 UA 即绕过站长主动屏蔽，故停用
import GalTuShuGuan from "./GalTuShuGuan";
import GalgameX from "./GalgameX";
// import JiMengACG from "./JiMengACG"; // 已禁用：绮梦ACG 已关闭，保留源文件但不再注册
import JiuLiACG from "./JiuLiACG";
// import KisuGal from "./KisuGal"; // 已禁用：原域名解析已失效（DNS ENOTFOUND），当前无可用新域名，故停用
import Koyso from "./Koyso";
import KunGalgame from "./KunGalgame";
// import LiSiTanACG from "./LiSiTanACG"; // 已禁用：已迁站 singureo.com 并改为 SPA 客户端搜索，原 search.xml 索引下线，无可调用接口，故停用
import LiangZiACG from "./LiangZiACG";
import MaoMaoWangPan from "./MaoMaoWangPan";
import MiaoYuanLingYu from "./MiaoYuanLingYu";
import Nysoure from "./Nysoure";
// import QingJiACG from "./QingJiACG"; // 已禁用：全站 Cloudflare 人机质询，所有 UA 均被拦截，无法抓取，故停用
import SakuGal from "./SakuGal";
import ShenShiTianTang from "./ShenShiTianTang";
import TianYouErCiYuan from "./TianYouErCiYuan";
import TouchGal from "./TouchGal";
import VNS from "./VNS";
// import VikaACG from "./VikaACG"; // 已禁用：官方接口增加了客户端签名与设备校验（返回 400 非法的客户端），无法服务端直接抓取，故停用
import WeiZhiYunPan from "./WeiZhiYunPan";
// import YingZhiGuang from "./YingZhiGuang"; // 已禁用：原 search.xml 索引文件已下线，无可用搜索接口，故停用
import YouYuDeloli from "./YouYuDeloli";
import YueYao from "./YueYao";
import ZeroFive from "./ZeroFive";
import ZhenHongXiaoZhan from "./ZhenHongXiaoZhan";
import ZiLingDeMiaoMiaoWu from "./ZiLingDeMiaoMiaoWu";
import ZiYuanShe from "./ZiYuanShe";
import xxacg from "./xxacg";

const platforms: Platform[] = [
  ACGYingYingGuai,
  // BiAnXingLu, // 已禁用
  DaoHeGal,
  FuFuACG,
  // GGBases, // 已禁用
  GalTuShuGuan,
  GalgameX,
  // JiMengACG, // 已禁用
  JiuLiACG,
  // KisuGal, // 已禁用
  Koyso,
  KunGalgame,
  // LiSiTanACG, // 已禁用
  LiangZiACG,
  MaoMaoWangPan,
  MiaoYuanLingYu,
  Nysoure,
  // QingJiACG, // 已禁用
  SakuGal,
  ShenShiTianTang,
  TianYouErCiYuan,
  TouchGal,
  VNS,
  // VikaACG, // 已禁用
  WeiZhiYunPan,
  // YingZhiGuang, // 已禁用
  YouYuDeloli,
  YueYao,
  ZeroFive,
  ZhenHongXiaoZhan,
  ZiLingDeMiaoMiaoWu,
  ZiYuanShe,
  xxacg,
];

export default platforms;
