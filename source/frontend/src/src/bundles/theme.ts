export default (() => {
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  const update = (theme: "dark" | "light") => {
    const html = document.getElementsByTagName("html")[0];
    if (!html) return;

    html.setAttribute("theme", theme);
  };

  const base = (e: MediaQueryListEvent) => {
    update(e.matches ? "dark" : "light");
  };

  const automatic = (props: boolean = true) => {
    if (!props) {
      media.removeEventListener("change", base, true);
    } else {
      update(
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
      );
      media.addEventListener("change", base, true);
    }

    return true;
  };

  return (theme: "dark" | "light" | "auto") => {
    const is_automatic = theme == "auto";

    automatic(is_automatic);
    if (!is_automatic) update(theme);
  };
})();
