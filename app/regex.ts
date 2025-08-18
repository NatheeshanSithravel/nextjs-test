export const generalCharactersRegex = /^[\w\(\)\[\]@#%! $&"*/\|\\\.,:;_+-=?'\^`~!{}<>]*$/;  //// Alphanumeric + Special characters
export const alphanumericCharactersRegex = /^[a-zA-Z0-9 ]*$/;  //// Alphanumeric
export const emailRegex = /^(?!.*\.\.)[a-zA-Z0-9._%+-]{2,}@[a-zA-Z0-9.-]{2,}\.[a-zA-Z]{1,}$/;
export const mobileRegex = /^(0(?!0)\d{9}|[17]\d{8})$/;
export const nicRegex = /^(?:\d{9}[VvXx]|\d{12})$/;
export const alphabetCharactersRegex = /^[a-zA-Z]*$/;
