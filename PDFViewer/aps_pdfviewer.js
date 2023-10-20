(function () {
    let tmpl = document.createElement("template");
    tmpl.innerHTML = `
      <style>
          fieldset {
              margin-bottom: 10px;
              border: 1px solid #afafaf;
              border-radius: 3px;
          }
          table {
              width: 100%;
          }
          input, textarea, select {
              font-family: "72",Arial,Helvetica,sans-serif;
              width: 100%;
              padding: 4px;
              box-sizing: border-box;
              border: 1px solid #bfbfbf;
          }
          input[type=checkbox] {
              width: inherit;
              margin: 6px 3px 6px 0;
              vertical-align: middle;
          }
      </style>
      <form id="form" autocomplete="off">
        <fieldset>
          <legend>General</legend>
          <table>
            <tr>
              <td><label for="PDFURL">PDF URL</label></td>
              <td><input id="PDFURL" name="PDFURL" type="text"></td>
            </tr>
            <tr>
              <td><label for="title">Title</label></td>
              <td><input id="title" name="title" type="text"></td>
            </tr>
            <tr>
              <td><label for="height">Height</label></td>
              <td><input id="height" name="height" type="text"></td>
            </tr>
          </table>
        </fieldset>
        <button type="submit" hidden>Submit</button>
      </form>
    `;

    class PDFViewerAps extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({ mode: "open" });
            this._shadowRoot.appendChild(tmpl.content.cloneNode(true));

            let form = this._shadowRoot.getElementById("form");
            form.addEventListener("submit", this._submit.bind(this));
            form.addEventListener("change", this._change.bind(this));
        }

        connectedCallback() {
        }

        _submit(e) {
            e.preventDefault();
            let properties = {};
            for (let name of PDFViewerAps.observedAttributes) {
                properties[name] = this[name];
            }
            this._firePropertiesChanged(properties);
            return false;
        }
        _change(e) {
            this._changeProperty(e.target.name);
        }
        _changeProperty(name) {
            let properties = {};
            properties[name] = this[name];
            this._firePropertiesChanged(properties);
        }

        _firePropertiesChanged(properties) {
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: properties
                }
            }));
        }

        get title() {
            return this.getValue("title");
        }
        set title(value) {
            this.setValue("title", value);
        }

        get PDFURL() {
            console.log(this.getValue("PDFURL"));
            return this.getValue("PDFURL");
        }
        set PDFURL(value) {
            this.setValue("PDFURL", value);
        }

        get height() {
            return this.getValue("height");
        }
        set height(value) {
            this.setValue("height", value);
        }

        getValue(id) {
            return this._shadowRoot.getElementById(id).value;
        }
        setValue(id, value) {
            this._shadowRoot.getElementById(id).value = value;
        }

        static get observedAttributes() {
            return [
                "PDFURL",
                "title",
                "height"
            ];
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue != newValue) {
                this[name] = newValue;
            }
        }
    }
    customElements.define("com-fd-djaja-sap-sac-pdfviewer-aps", PDFViewerAps);
})();
