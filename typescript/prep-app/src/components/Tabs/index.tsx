import { useState } from "react";

export function PageArrayTabs({ pages }: { pages: Array<{ title: string, content: React.ReactNode }> }){
  const [activePage, setActivePage] = useState(0);
  
  const page = pages[activePage];
  if(!page) return null;

  return <>
    <nav>
      {pages.map((page, i) => (
        <button
          key={`${page.title}-${i}`}
          disabled={activePage === i}
          className={activePage === i ? 'active' : ''}
          onClick={() => setActivePage(i)}
        >{page.title}</button>
      ))}
    </nav>
    {!page ? null : page.content}
  </>
}

import { Link, useLocation } from "react-router-dom";
type LocalURL = { pathname: string, search: string, hash: string };
export function LinkTabs(
  { pages }: { pages: Array<null | { title: string, href: string, isActive?: (location: LocalURL) => boolean }> }){
  const location = useLocation();
  return (
    <nav>
      {pages.map((page, i) => (
        !page ? null :
        <Link
          key={`${page.title}-${i}`}
          to={page.href}
          className={
            page.isActive ? page.isActive(location) ? 'active' : "" :
            location.pathname === page.href ? 'active' : ''
          }
        >{page.title}</Link>
      ))}
    </nav>
  )
}
