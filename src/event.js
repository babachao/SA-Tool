/**
 * @description: 将数据处理为C端可识别的埋点数据
 * @param {*} data 拿到的数据源
 */
export function handleDataSource(data) {
  const dataObj = {};
  data.forEach((item) => parseStr(item.code, dataObj));
  return dataObj;
}

/**
 * @description: 解析code字符串，拿到对应的对象数据
 * @param {*} code 字符串数据
 */
function parseStr(code, dataObj) {
  // 1、【请手动设置】代表自定义的属性，通过【replace】替换成""
  const str = code.replace(/请手动设置/g, '""');
  // 2、通过【indexOf】查找到左右花括号的下标
  const leftCurlyBrackets_sub = str.indexOf("{");
  const rightCurlyBrackets_sub = str.indexOf("}");
  // 3、用花括号左右下标的值，通过【substring】截取出对象中的数据字符串
  const objData = str.substring(
    leftCurlyBrackets_sub,
    rightCurlyBrackets_sub + 1
  );
  // 4、使用【Function()】将字符串解析成代码后进行执行，并返回最后一行代码执行的结果
  // 本来是使用【eval()】执行字符串，查找MDN文档后，选择使用了【Function()】
  // eval和Function的具体差异看MDN文档：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/eval
  // eval(`(${objData})`)
  const { track_sign, ...obj } = Function(`"use strict";return (${objData})`)();
  // 5、通过【split】拿到当前event_type。例：track_sign = aHFPLUS.b20118.d20119_27972.click
  const type = track_sign.split(".");
  // 6、数组最后一个为当前的event_type, 并放入到obj对象中。 例：[aHFPLUS, b20118，d20119_27972,click]
  obj.event_type = type[type.length - 1];
  dataObj[track_sign] = obj;
}

/**
 * 1、由于【navigator.clipboard】需要https等安全上下文，
 * 当浏览器识别为不安全的情况下，是无法复制
 * 2、所以使用【document.execCommand】作为兜底方案
 * 参考阮一峰大佬博客：https://www.ruanyifeng.com/blog/2021/01/clipboard-api.html
 * */
export function copyToClipboard(textToCopy) {
  if (navigator.clipboard && window.isSecureContext) {
    // navigator clipboard 向剪贴板写文本
    return navigator.clipboard.writeText(textToCopy);
  } else {
    // 创建text area
    let textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    textArea.style.display = "none";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    // 执行复制命令并移除文本框
    document.execCommand("copy");
    textArea.remove();
  }
}

/**
 * @description: 将textarea框的数据格式化
 */
export function formatter(val) {
  try {
    return JSON.stringify(JSON.parse(val), undefined, 2);
  } catch (e) {
    //TODO handle the exception
  }
}

/**
 * @description: 文本复制到textarea框时，将数据加载右边展示
 */
export function pretifyJson(json) {
  const req = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;
  return JSON.stringify(json, undefined, 4).replace(req, replaceJson);
}

/**
 * @description: 转换格式
 */
function replaceJson(match) {
  let cls = "<span>";
  if (/^"/.test(match)) {
    if (/:$/.test(match)) {
      cls = "<span class='key'>";
    } else {
      cls = "<span class='string'>";
    }
  } else if (/true|false/.test(match)) {
    cls = "<span class='boolean'>";
  } else if (/null/.test(match)) {
    cls = "<span class='null'>";
  } else if (!isNaN(match)) {
    cls = "<span class='number'>";
  }
  return cls + match + "</span>";
}

// TODO: 粘贴大量数据时，textarea会卡顿一下，加个loading。TODO: 但发现这个卡顿时阻塞了页面的渲染
// let mask = null;
// document.addEventListener('paste', (event) => {
//   console.log(event);
//   const tDom =  document.getElementById('textId');
//   mask = document.getElementById('mask');
//   if (event.target === tDom) {
//     mask.style.display = 'flex';
//   }
// })

// const spanStyle = (index) => ({animationDelay: `${(index) * 0.13}s`});
// // 生成loading中的5个span标签
// const spanDoms = new Array(5).fill(1).map((e, index) => <span key={index} style={spanStyle(index + 1)}></span>);
// <div id="mask" className="mask"><div className="loadingThree">{spanDoms}</div></div>
