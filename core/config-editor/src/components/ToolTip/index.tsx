import toolttipIcon from "./icons8-info.svg";

export function ToolTipSpan(
  { children, tip, clickable = false, className, style }: {
    children: React.ReactNode,
    tip: string,
    clickable?: boolean,
    className?: string,
    style?: React.CSSProperties
  }
){
  return <span
    data-tooltip-id={clickable ? "global-tooltip-clickable" : "global-tooltip-non-clickable"}
    data-tooltip-content={tip}
    style={{ display: "inline-flex", alignItems: "center", gap: "0.25em", ...style }}
    className={className}
  >
    <img
      src={toolttipIcon} alt="View For More Info"
      style={{
        height: "1em",
        width: "auto",
        verticalAlign: "middle",
        maxWidth: "1em",
      }}
    />
    {children}
  </span>
}
