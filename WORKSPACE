workspace(
    name = "mosaic",
    managed_directories = {"@npm": ["node_modules"]},
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Add NodeJS rules
http_archive(
    name = "build_bazel_rules_nodejs",
    patches = ["//tools:multiple-node-versions.patch"],
    sha256 = "f7037c8e295fdc921f714962aee7c496110052511e2b14076bd8e2d46bc9819c",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/4.4.5/rules_nodejs-4.4.5.tar.gz"],
)

# Add sass rules
http_archive(
    name = "io_bazel_rules_sass",
    sha256 = "435efe759f1c8baffadc320ecc1830454da181fa790aa83bb4326f07e903a0f4",
    strip_prefix = "rules_sass-1.41.0",
    urls = [
        "https://github.com/bazelbuild/rules_sass/archive/1.41.0.zip",
    ],
)

# Add skylib which contains common Bazel utilities. Note that `rules_nodejs` would also
# bring in the skylib repository but with an older version that does not support shorthands
# for declaring Bazel build setting flags.
http_archive(
    name = "bazel_skylib",
    sha256 = "191ea53b19b7e49b5b63d0ef81d1a6278227f9ac2c09fed1c2b3a75d573f1eeb",
    strip_prefix = "bazel-skylib-b2ed61686ebca2a44d44857fef5b3e1d31cc2483",
    urls = [
        "https://github.com/bazelbuild/bazel-skylib/archive/b2ed61686ebca2a44d44857fef5b3e1d31cc2483.tar.gz",
    ],
)

http_archive(
    name = "rules_pkg",
    sha256 = "a89e203d3cf264e564fcb96b6e06dd70bc0557356eb48400ce4b5d97c2c3720d",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/rules_pkg/releases/download/0.5.1/rules_pkg-0.5.1.tar.gz",
        "https://github.com/bazelbuild/rules_pkg/releases/download/0.5.1/rules_pkg-0.5.1.tar.gz",
    ],
)

load("@rules_pkg//:deps.bzl", "rules_pkg_dependencies")

rules_pkg_dependencies()

load("@bazel_skylib//:workspace.bzl", "bazel_skylib_workspace")

bazel_skylib_workspace()

load("@build_bazel_rules_nodejs//:index.bzl", "check_bazel_version", "node_repositories", "yarn_install")

check_bazel_version("4.0.0")

node_repositories(
    node_version = "16.10.0",
    package_json = ["//:package.json"],
)

load("@build_bazel_rules_nodejs//nodejs:repositories.bzl", "nodejs_register_toolchains")

# This call sets up another repository for Node 12.x used in integration tests. This
# allows us to ensure our schematic code works with NodeJS v12 LTS. The Node v12.x
# version is not fetched unless explicitly requested by the tests.
nodejs_register_toolchains(
    name = "node12",
    node_version = "12.20.0",
)

load("//tools:integration.bzl", "create_npm_package_archive_build_file")

yarn_install(
    name = "npm",
    # We add the postinstall patches file here so that Yarn will rerun whenever
    # the file is modified.
    data = [
        "//:tools/postinstall/apply-patches.js",
    ],
    # Add archive targets for some NPM packages that are needed in integration tests.
    manual_build_file_contents = create_npm_package_archive_build_file(),
    package_json = "//:package.json",
    quiet = False,
    yarn_lock = "//:yarn.lock",
)

load("@npm//@bazel/protractor:package.bzl", "npm_bazel_protractor_dependencies")

npm_bazel_protractor_dependencies()

# Setup web testing. We need to setup a browser because the web testing rules for TypeScript need
# a reference to a registered browser (ideally that's a hermetic version of a browser)
load("@io_bazel_rules_webtesting//web:repositories.bzl", "web_test_repositories")

web_test_repositories()

# Fetch transitive dependencies which are needed to use the Sass rules.
load("@io_bazel_rules_sass//:package.bzl", "rules_sass_dependencies")

rules_sass_dependencies()

# Setup the Sass rule repositories.
load("@io_bazel_rules_sass//:defs.bzl", "sass_repositories")

sass_repositories()

# Setup repositories for browsers provided by the shared dev-infra package.
load(
    "@npm//@angular/dev-infra-private/bazel/browsers:browser_repositories.bzl",
    _dev_infra_browser_repositories = "browser_repositories",
)

_dev_infra_browser_repositories()

load("@build_bazel_rules_nodejs//toolchains/esbuild:esbuild_repositories.bzl", "esbuild_repositories")

esbuild_repositories()
