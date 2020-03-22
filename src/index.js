/* @flow */

const { isEqual, cloneDeep, get } = require("lodash");

class OperateOn {
  migration: Object;

  makeRequest: Object;

  contentType: any;

  fields: any;

  modifyContentType: any;

  globalConfiguration: any;

  constructor(
    migration: any,
    { makeRequest }: Object,
    contentType: any,
    fields: any,
  ): any {
    this.migration = migration;
    this.makeRequest = makeRequest;
    this.contentType = contentType;
    this.fields = fields;
    this.modifyContentType = null;
  }

  get operationOnContent(): any {
    return async (): any => {
      const content: any = await this.determineOperation();
      const { items } = content;
      const { id, opts } = this.contentType;
      this.modifyContentType =
        items.length > 0
          ? this.migration.editContentType(id, opts)
          : this.migration.createContentType(id, opts);
      return this.modifyContentType;
    };
  }

  get operationOnField(): any {
    return async (): any => {
      const content = await this.determineOperation();
      const { items } = content;
      const contentfulFields = get(items[0], "fields", []);

      this.fields.forEach((field: any) => {
        const alreadyExistedField = contentfulFields.find(
          (contentfulField: any): Object => contentfulField.id === field.id,
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
              ...OperateOn.globalConfiguration(cloneField),
            })
          ) {
            this.modifyContentType.editField(field.id, {
              name: field.name,
              ...OperateOn.globalConfiguration(field),
            });
          }
        } else if (!alreadyExistedField && field.modify) {
          const hasBeenCreated = contentfulFields.find(
            (contentfulField: any): any =>
              field.modify.old_id === contentfulField.id,
          );

          if (hasBeenCreated) {
            this.modifyContentType.changeFieldId(field.modify.old_id, field.id);
            this.modifyContentType.editField(field.id, {
              name: field.name,
              ...OperateOn.globalConfiguration(field),
            });
          } else if (!hasBeenCreated) {
            this.modifyContentType.createField(field.id, {
              name: field.name,
              ...OperateOn.globalConfiguration(field),
            });
          }
        } else if (!alreadyExistedField && field && !field.remove) {
          this.modifyContentType.createField(field.id, {
            name: field.name,
            ...OperateOn.globalConfiguration(field),
          });
        }
      });

      this.fields
        .filter(
          (field: any): any =>
            field.helpText ||
            field.widgetId ||
            field.falseLabel ||
            field.trueLabel,
        )
        .forEach((field: any) => {
          const config = {};

          if (field.helpText) config.helpText = field.helpText;
          if (field.falseLabel) config.falseLabel = field.falseLabel;
          if (field.trueLabel) config.trueLabel = field.trueLabel;

          this.modifyContentType.changeFieldControl(
            field.id,
            "builtin",
            field.widgetId,
            config,
          );
        });

      if (!OperateOn.orderFields(this.fields, contentfulFields)) {
        this.fields
          .filter((field: any): any => !field.remove)
          .forEach((field: any): any =>
            this.modifyContentType.moveField(field.id).toTheBottom(),
          );
      }
    };
  }

  static orderFields(fields: any, contentfulFields: any): any {
    let identical = true;
    let index = 0;
    const maximumLength = fields.length - 1;

    while (identical && index <= maximumLength) {
      try {
        if (fields[index].id !== contentfulFields[index].id) {
          identical = false;
        }
        index += 1;
      } catch (error) {
        identical = false;
      }
    }

    return identical;
  }

  /**
   *
   * @param {Object} param0
   * utility functions
   */

  static globalConfiguration({
    type = "Symbol",
    required = true,
    validations = [],
    items = null,
    linkType = null,
    localized = false,
    disabled = false,
    omitted = false,
  }: Object): any {
    const config: Object = {
      type,
      required,
      validations,
      localized,
      disabled,
      omitted,
    };

    if (linkType) config.linkType = linkType;

    if (items) config.items = items;

    return config;
  }

  async determineOperation(): any {
    const content = await this.makeRequest({
      method: "GET",
      url: `/content_types?sys.id[in]=${this.contentType.id}`,
    });

    return content;
  }
}

module.exports = OperateOn;
