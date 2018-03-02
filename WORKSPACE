workspace(name = "mosaic_src")

git_repository(
    name = "build_bazel_rules_nodejs",
    remote = "https://github.com/bazelbuild/rules_nodejs.git",
    tag = "0.4.0",
)

load("@build_bazel_rules_nodejs//:defs.bzl", "node_repositories")

node_repositories(package_json = ["//:package.json"])

# Add TypeScript rules
git_repository(
    name = "build_bazel_rules_typescript",
    remote = "https://github.com/bazelbuild/rules_typescript.git",
    tag = "0.10.0",
)

load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace")

ts_setup_workspace()

# Add sass rules
git_repository(
  name = "io_bazel_rules_sass",
  remote = "https://github.com/bazelbuild/rules_sass.git",
  tag = "0.0.3",
)

load("@io_bazel_rules_sass//sass:sass.bzl", "sass_repositories")

sass_repositories()

# Add Angular rules
local_repository(
  name = "angular",
  path = "node_modules/@angular/bazel",
)

# Add rxjs
local_repository(
  name = "rxjs",
  path = "node_modules/rxjs/src",
)


