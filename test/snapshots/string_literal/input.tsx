export const Dialog = () => {
  const text = "Hello World";

  // @ts-expect-error
  return <Dialog
    text={text}
    alt="Howdy, World"
  />;
};
