import { PropsWithChildren, ReactNode } from "react";

import "./style.css";
import { ClickableButton } from "./ClickableButton";

type Props = PropsWithChildren<{
  info: { title: string, description?: string, note?: ReactNode },
  buttons: Array<{ label: string, onClick: ()=>any, disabled?: boolean }>,
}>;

export function FollowButtonForm({ info, buttons, children }: Props){
  return (
    <div className="follow-button-container">
      <div className="form-container">
        {children}
      </div>

      <div className="action-container">
        <div>
          <div>
            <h3>{info.title}</h3>
            {info.description && <p>{info.description}</p>}
          </div>

          <ul className="button-list">
          {buttons.map((button, i) => (
            <li key={button.label + i}>
              <ClickableButton
                onClick={button.onClick}
                disabled={button.disabled}
              >
                {button.label}
              </ClickableButton>
            </li>
          ))}
          </ul>

          {info.note && (
            <footer>
              <div>{info.note}</div>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}
