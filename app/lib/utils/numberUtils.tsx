export const humanizeNumber = (
  value: number,
  options?: { delimiter?: string; separator?: string },
) => {
  options = options || {};
  const d = options.delimiter || ",";
  const s = options.separator || ".";
  const strValue = value.toString().split(".");
  strValue[0] = strValue[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + d);
  return strValue.join(s);
};
