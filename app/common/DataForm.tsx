import React from "react";

type DataFormProps = React.DetailedHTMLProps<
  React.FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
> & {
  callback?: (data: Record<string, string>) => void;
};

export default function DataForm(props: DataFormProps) {
  const { callback, ...formProps } = props;

  return (
    <form
      {...formProps}
      onSubmit={(event) => {
        event.preventDefault();
        if ((document.activeElement as any).type == "submit") {
          const res: Record<string, string> = {};
          const data = new FormData(event.target as any);
          [...data.entries()].forEach((d, i) => {
            res[d[0]] = d[1].toString();
          });
          props.callback && props.callback(res);
        }
      }}
    >
      {props.children}
    </form>
  );
}
