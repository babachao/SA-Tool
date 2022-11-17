import { useState } from "react";
import {
  handleDataSource,
  formatter,
  pretifyJson,
  copyToClipboard
} from "./event";
import "./styles.css";

export default function App() {
  const [nums, setNums] = useState(null);
  const [preHtml, setPreHtml] = useState("");
  const [tipStr, setTipStr] = useState("");
  const [inputPre, setInputPre] = useState("");
  const [textareaVal, setTextareaVal] = useState("");
  const [saName, setSaName] = useState("");
  const errTip = "未能解析出对应的埋点数据";
  /**
   * @description Copy方法
   * */
  const copyData = () => {
    copyToClipboard(inputPre);
    let a = "background: #606060; color: #fff;";
    console.log(`%c 复制的文本为: %c${inputPre}`, a, "color: #B6373D;");
    inputPre && setTipStr("复制成功");
  };

  /**
   * @description textarea的Input方法
   * */
  const textareaInput = (e) => {
    const value = e.target.value;
    const frist = value[0];
    const last = value[value.length - 1];
    // 简单判断
    try {
      if ((frist === "[" && last === "]") || (frist === "{" && last === "}")) {
        let { data } = JSON.parse(value) || {};
        // 复制到左边时，整理格式
        if (data) {
          setNums(data.length);
          setSaName(data[0].pageName);
          // 拿到处理后的数据
          data = handleDataSource(data);
        }
        // 将处理后的数据设置到右边
        setPreHtml(pretifyJson(data || value));
        setInputPre(JSON.stringify(data));
        setTipStr("");
      } else {
        textareaVal && setTipStr(errTip);
      }
    } catch (error) {
      // TODT:
      setTipStr(errTip);
    }
  };
  // 清除数据
  const clearData = () => {
    setTextareaVal("");
    setInputPre("");
    setPreHtml("");
    setNums(null);
    setSaName("");
    setTipStr("");
  };
  return (
    <div className="box">
      {/* 左边输入的框 */}
      <textarea
        id="textId"
        name="textarea"
        cols="50"
        rows="30"
        placeholder="请粘贴需要转换的数据"
        value={textareaVal}
        onInput={textareaInput}
        onChange={(e) => {
          setTextareaVal(formatter(e.target.value));
          // setTipStr("");
        }}
      ></textarea>
      <div>
        {saName && <p>埋点页面为: [{saName}]</p>}
        {nums && <p>共转换{nums}条埋点数据</p>}
        <div className="copDom">
          <button onClick={copyData}>复制埋点数据</button>
        </div>
        <div>
          <button onClick={clearData}>清理数据</button>
        </div>
        {tipStr && <p className="colorRed">{tipStr}</p>}
      </div>
      {/* <!-- 右边json数据渲染 --> */}
      <pre id="data_info" dangerouslySetInnerHTML={{ __html: preHtml }}></pre>
    </div>
  );
}
