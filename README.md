# Contentful Smart Migration

## What is Contentful?

[Contentful](https://www.contentful.com/developers/docs/) Provides a API driven CMS for websites, apps, and other digital devices. Unlike a traditional CMS, Contentful was built to integrate with the modern software stack. It offers a centralize space for structured content, powerful management and delivery APIs.

## Why ?

This provides a reusable way of building and running your Contentful migration scripts for a projects that use multiple contentful environments.

This package is smart enough to know if this is a new content type or a pre-existing one that will need to be modified. This allows a migration script life span to be the life of the need to modify the Content Type. Once this field is stable you can remove the file.

## Getting Started

### Pre-requisites

- Node

### Install

Install with [npm](https://www.npmjs.com/)

npm:

```
npm i -D contentful-smart-migration
```

## Core Features

Class Params

```
const component = new OperateOn(migration, context, contentTypeExample, fields);
```

- OperateOn : **Class**
  - `contentful migration`: [Contentful Migration method](https://github.com/contentful/contentful-migration#migration)
  - `context` : [Contentful Object](https://github.com/contentful/contentful-migration#context)
  - `contentTypeExample` : Object
  - `fields` : Array

Class Methods

```
// using async/await

await component.operationOnContent;
await component.operationOnField;
```

- `operationOnContent` : sets the operation on the content type
- `operationOnField` : sets the operation on the content type field

## Use Cases

### Managing a Content-Type

Creating the Content Type

- `id : string` - The ID of the Content Type.
- `opts : Object` - Content type definition, with the following options:

  - `name : string` - Name of the content type.
  - `description : string` - Description of the content type.
  - `displayField : string` - ID of the field to use as the display field for the content type. This is referred to as the "Entry title" in the web application.

More info on the Content Type can be found [here](https://github.com/contentful/contentful-migration#createcontenttypeid-opts--contenttype)

Creating a Content Type example, below.

```
const componentExample = {
  id: "componentExample",
  opts: {
    name: "Component > Example",
    description: "Component Link that accepts xyz",
    displayField: "title",
  },
};
```

<details>
    <summary>Creating a Content-Type without CSM </summary>

    const author = migration.createContentType('author', {
    name: 'Author',
    description: 'Author of blog posts or pages',
    displayField: "title",
    })

</details>

### Managing a Content-Type's Field

#### Create a Simple Field

Creating a Symbol (Short Text) Field

- `id : string` - (required) - The ID of the field.
- `name : string` - (required) – Field name.

```

// All fields are objects that go inside the field's array

const fields = [
    {
        id: "name",
        name: "Name"
    }
]
```

<details>
    <summary>Creating a field without CSM </summary>

    const author = migration.createContentType('author', {
    name: 'Author',
    description: 'Author of blog posts or pages'
    })

    //Object

    author.createField(id, {
        name: "Name",
        type: "Symbol,
        required: true
    })

    //JS chaining
    const name = author.createField('name')
    name.name('Name')
        .type('Symbol')
        .required(true)

</details>

Creating a Text (Long Text) or any Field other then the default Symbol (Short Text) field

- `id : string` - (required) - The ID of the field.
- `name : string` - (required) – Field name.
- `type : string` - (defaults to Symbol) Field type, amongst the following values: other types can be found [here](https://github.com/contentful/contentful-migration#createfieldid-opts--field)

```
// Text (Long Text) field example below

const fields = [
    {
        id: "name",
        name: "Name",
        type: "Text",
    }
]
```

#### Different Field Use Cases

Text Field with validation

```
const fields = [
  {
    id: "description",
    name: "Description",
    validations: [
      {"size": { "min": 5, "max": 20}}
    ]
  }
]
```

Image Field with validation and help text

```
const fields = [
  {
    id: "image",
    name: "Image",
    type: "Link",
    linkType: "Asset",
    validation: [
      {"linkMimetypeGroup": ["image"]}
    ],
    widgetId: "assetLinkEditor" // widgetId required when using a help text for a field that is not Symbol
    helpText: "Some help text for the contentful user" // optional, this will fire off the changeFieldControl method
  }
]
```

Boolean Field

```
const fields = [
  {
    id: "isAudio",
    name: "Is Audio",
    type: "Boolean",
    trueLabel: "yes", // optional - change the true label that shows up on contentful entry
    falseLabel: "no", // optional - change the false label that shows up on contentful entry
  }
]
```

Array Fields that accept a certain content type

```
const fields = [
  {
    id: "components",
    name: "Components",
    type: "Array", // (requires items)
    items: {
      type: "Link",
      linkType: "Entry",
      validations: {
        { linkContentType: [ 'my-content-type' ] } // Only allows this entry to be linked
      }
    }
    validations : [
      {"size": { "max": 20}}  // no more then 20 entries can be link to this field
    ]
  }
]
```

Deleting a field

```
const fields = [
  {
    id: "components",
    name: "Components",
    remove: true, // the remove property tells CSM to remove this field from Contentful.
  }
]
```

**Important** If called again in the same environment the field with the remove property will be ignored. When you delete the property "remove", it will tell the CSM to create the field again.

Modify a Field (changing the name)

```
const fields = [
  {
    id: "components",
    name: "Components", // Just change the name to a new name and it will automatically update the name of this field
  }
]
```

Modify a Field (changing the id)

```
// Original Content Type
const fields = [
  {
    id: "components",
    name: "Components",
  }
]

// Add the modify object on the original content type, and add the id to the old_id property, and provide the new id in the id key.

const fields = [
  {
    id: "newComponents",
    name: "Components",
    modify: {
      old_id: "components"
    }
  }
]
```

### All Together Example

Creating two simple fields

```
const OperateOn = require("contentful-smart-migration");

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
    {
      id: "name",
      name: "Name",
    },
  ];

  const component = new OperateOn(migration, context, componentExample, fields);
  await component.operationOnContent();
  await component.operationOnField();
};
```

## Get involved

## License

This repository is published under the [MIT](https://github.com/caesarbell/contentful-smart-migration/blob/master/LICENSE) license.

## Code of Conduct

We want to provide a safe, inclusive, welcoming, and harassment-free space and experience for all participants, regardless of gender identity and expression, sexual orientation, disability, physical appearance, socioeconomic status, body size, ethnicity, nationality, level of experience, age, religion (or lack thereof), or other identity markers. Basically open to all developers.
