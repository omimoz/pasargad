import type { ReactNode } from "react";
export interface ShowProps {
  children: ReactNode;
}

export interface WhenProps extends ShowProps {
  isTrue?: boolean;
}

export interface ElseProps extends ShowProps {
  render?: ReactNode;
}
export type ShowChildElement =
  | React.ReactElement<WhenProps>
  | React.ReactElement<ElseProps>;