const OperateOn = require("../src/index");

module.exports = async function(migration, context) {
  const componentExample = {
    id: "componentExample",
    opts: {
      name: "Component > Example",
      description: "Component Link that accepts xyz",
      displayField: "title",
    },
  };

  const fields = [
    {
      id: "title",
      name: "Title",
    },
  ];

  const component = new OperateOn(migration, context, componentExample, fields);
  await component.operationOnContent();
  await component.operationOnField();
};
