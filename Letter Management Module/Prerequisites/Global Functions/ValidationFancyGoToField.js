//Parameter: fieldName

Swal.update({ onAfterClose: () => VV.Form.Global.ValidationGoToFieldFromModal(`${fieldName}`) })

Swal.close()