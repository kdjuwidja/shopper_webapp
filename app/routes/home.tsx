import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { Search } from "../search/search";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Find grocery with AI" },
    { name: "description", content: "This is a grocery app that uses AI to find the best deals." },
  ];
}

export default function Home() {
  return <Search />;
}
