export const Component = () => {
  const simple = `Hello World`;

  const name = "Alice";
  const greeting = `Hello ${name}!`;

  const age = 20;
  const message = `Name: ${name}, Age: ${age} years old`;

  return <div title={`Greeting: ${name}`}>{simple}</div>;
};
