import React, { useState } from "react";

interface ContainerProps {
  children: React.ReactNode;
}
function Container(props: ContainerProps) {
  const [value, setValue] = useState();

  return <div className=""></div>;
}

interface OptionProps {
  value: string;
  children: React.ReactNode;
}
function Option(props: OptionProps) {
  return <div>{props.children}</div>;
}

const Dropdown = { Container, Option };

export default Dropdown;
