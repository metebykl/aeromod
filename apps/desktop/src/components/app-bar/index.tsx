import { Link } from "@tanstack/react-router";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@aeromod/ui/components/menubar";
import { quitApp, showAbout } from "@/lib/utils";
import { PresetMenu } from "./preset-menu";

export function AppBar() {
  return (
    <>
      <div className="fixed left-0 top-0 z-50 h-7 w-full">
        <Menubar className="h-7 rounded-none border-0 border-b">
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem asChild>
                <Link to="/settings">Settings</Link>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onSelect={() => quitApp()}>Exit</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <PresetMenu />
          <MenubarMenu>
            <MenubarTrigger>Help</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onSelect={() => showAbout()}>About</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    </>
  );
}
