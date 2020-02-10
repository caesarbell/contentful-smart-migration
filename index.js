const { isEqual, cloneDeep, get } = require("lodash");

class OperateOn {
  constructor(migration, { makeRequest }, contentType, fields) {
    this.migration = migration;
    this.makeRequest = makeRequest;
    this.contentType = contentType;
    this.fields = fields;
    this.modifyContentType;
  }

  get operationOnContent() {
    return this.determineOperation().then(content => {
      const items = content.items;
      const id = this.contentType.id;
      const opts = this.contentType.opts;
      this.modifyContentType =
        items.length > 0
          ? this.migration.editContentType(id, opts)
          : this.migration.createContentType(id, opts);

      return this.modifyContentType;
    });
  }

  get operationOnField() {
    return this.determineOperation().then(content => {
      const items = content.items;
      const contentfulFields = get(items[0], "fields", []);

      this.fields.forEach(field => {
        let alreadyExistedField = contentfulFields.find(
          contentfulField => contentfulField.id === field.id
        );

        if (alreadyExistedField) {
          if (field && field.remove === true) {
            this.modifyContentType.deleteField(field.id);
          }

          const cloneField = cloneDeep(field);

          if (
            cloneField.helpText ||
            cloneField.falseLabel ||
            cloneField.trueLabel ||
            cloneField.widgetId ||
            cloneField.modify ||
            cloneField.remove
          ) {
            delete cloneField.helpText;
            delete cloneField.falseLabel;
            delete cloneField.trueLabel;
            delete cloneField.widgetId;
            delete cloneField.modify;
            delete cloneField.remove;
          }

          if (
            !isEqual(alreadyExistedField, {
              ...cloneField,
              ...this.globalConfiguration(cloneField)
            })
          ) {
            this.modifyContentType.editField(field.id, {
              name: field.name,
              ...this.globalConfiguration(field)
            });
          }
        } else {
          if (!alreadyExistedField && field.modify) {
            const hasBeenCreated = contentfulFields.find(
              contentfulField => field.modify.old_id === contentfulField.id
            );

            if (hasBeenCreated) {
              this.modifyContentType.changeFieldId(
                field.modify.old_id,
                field.id
              );
              this.modifyContentType.editField(field.id, {
                name: field.name,
                ...this.globalConfiguration(field)
              });
            } else if (!hasBeenCreated) {
              this.modifyContentType.createField(field.id, {
                name: field.name,
                ...this.globalConfiguration(field)
              });
            }
          } else if (!alreadyExistedField && field && !field.remove) {
            this.modifyContentType.createField(field.id, {
              name: field.name,
              ...this.globalConfiguration(field)
            });
          }
        }
      });

      this.fields
        .filter(
          field =>
            field.helpText ||
            field.widgetId ||
            field.falseLabel ||
            field.trueLabel
        )
        .forEach(field => {
          const config = {};

          if (field.helpText) config.helpText = field.helpText;
          if (field.falseLabel) config.falseLabel = field.falseLabel;
          if (field.trueLabel) config.trueLabel = field.trueLabel;

          this.modifyContentType.changeFieldControl(
            field.id,
            "builtin",
            field.widgetId,
            config
          );
        });
    });
  }

  globalConfiguration({
    type = "Symbol",
    required = true,
    validations = [],
    items = null,
    linkType = null,
    localized = false,
    disabled = false,
    omitted = false
  }) {
    const config = {
      type,
      required,
      validations,
      localized,
      disabled,
      omitted
    };

    if (linkType) config.linkType = linkType;

    if (items) config.items = items;

    return config;
  }

  async determineOperation() {
    const content = await this.makeRequest({
      method: "GET",
      url: `/content_types?sys.id[in]=${this.contentType.id}`
    });
    return content;
  }
}

module.exports = OperateOn;
