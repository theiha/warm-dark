{
  description = "Development environment for warm-dark";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      projectName = "warm-dark";

      # Support all systems by default
      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];

      forAllSystems = nixpkgs.lib.genAttrs supportedSystems;
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          default = pkgs.mkShell {
            buildInputs = with pkgs; [
              nodejs
              vsce
            ];

            shellHook = ''
              echo -e "\e[1;32m[+] ${projectName} development environment loaded.\e[0m"
            '';
          };
        }
      );
    };
}
