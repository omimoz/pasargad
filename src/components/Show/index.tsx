import React, {
    Children,
    type ReactNode,
  } from "react";
  import type {
    ElseProps,
    ShowChildElement,
    ShowProps,
    WhenProps,
  } from "./type";
  
  function Show({ children }: ShowProps) {
    let when: ReactNode = null;
    let otherwise: ReactNode = null;
  
    Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) return;
      const element = child as ShowChildElement;
      if ("isTrue" in element.props) {
        if (!when && element.props.isTrue) {
          when = element;
        }
        return;
      }
      otherwise = element;
    });
  
    return <>{when || otherwise}</>;
  }
  
  Show.When = ({ isTrue, children }: WhenProps) =>
    isTrue ? <>{children}</> : null;
  
  Show.Else = ({ render, children }: ElseProps) =>
    <>{children ?? render}</>;
  
  export default Show;
  