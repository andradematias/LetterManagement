//CloseButtonFormat hides the VV close button, changes the form close button colors, and makes them clickable even in read-only mode. 
//This function must be called on Load and in EventsEnd.
VV.Form.Global.CloseButtonFormat();

// Relate uploaded documents
VV.Form.Global.RelateDocuments(VV.Form.GetFieldValue('Form ID'));