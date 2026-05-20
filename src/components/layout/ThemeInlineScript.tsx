export default function ThemeInlineScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var r=document.documentElement;var raw=localStorage.getItem("paloma-ui");if(!raw)return;var p=JSON.parse(raw),t=p&&p.state&&p.state.theme;if(t==="dark")r.setAttribute("data-theme","dark");else r.removeAttribute("data-theme");}catch(e){}})();`,
      }}
    />
  );
}
