export default function Win({ title, tone = "", dots = true, children, style, bodyStyle }) {
  return (
    <div className="win" style={style}>
      <div className={"win-bar " + tone}>{title}{dots && <span className="win-dots"><span>_</span><span>▢</span><span>x</span></span>}</div>
      <div className="win-body" style={bodyStyle}>{children}</div>
    </div>);
}
