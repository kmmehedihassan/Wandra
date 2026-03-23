export function Prevent(fn, defaultOnly) {
  return (e, ...params) => {
    e && e.preventDefault();
    !defaultOnly && e && e.stopPropagation();
    fn(e, ...params);
  };
}
