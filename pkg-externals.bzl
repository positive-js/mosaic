load("//tools:config.bzl", "MOSAIC_ENTRYPOINTS", "CDK_ENTRYPOINTS")

load("//:packages.bzl", "MDC_PACKAGES")

# Base list of externals which should not be bundled into the APF package output.
# Note that we want to disable sorting of the externals as we manually group entries.
# buildifier: disable=unsorted-list-items
PKG_EXTERNALS = [
    # Framework packages.
    "@angular/animations",
    "@angular/common",
    "@angular/common/http",
    "@angular/common/http/testing",
    "@angular/common/testing",
    "@angular/core",
    "@angular/core/testing",
    "@angular/forms",
    "@angular/platform-browser",
    "@angular/platform-browser-dynamic",
    "@angular/platform-browser-dynamic/testing",
    "@angular/platform-browser/animations",
    "@angular/platform-server",
    "@angular/router",

    # Primary entry-points in the project.
    "@angular/cdk",
    "@angular/cdk-experimental",
    "@angular/google-maps",
    "@angular/material",
    "@angular/material-experimental",
    "@angular/material-moment-adapter",
    "@angular/material-luxon-adapter",
    "@angular/material-date-fns-adapter",
    "@angular/youtube-player",

    # Third-party libraries.
    "kagekiri",
    "moment",
    "moment/locale/fr",
    "moment/locale/ja",
    "luxon",
    "date-fns",
    "protractor",
    "rxjs",
    "rxjs/operators",
    "selenium-webdriver",
]

# Configures the externals for all MDC packages.
def setup_mdc_externals():
    for pkg_name in MDC_PACKAGES:
        PKG_EXTERNALS.append(pkg_name)

# Creates externals for a given package and its entry-points.
def setup_entry_point_externals(packageName, entryPoints):
    PKG_EXTERNALS.extend(["@angular/%s/%s" % (packageName, ep) for ep in entryPoints])

setup_mdc_externals()

setup_entry_point_externals("cdk", CDK_ENTRYPOINTS)
setup_entry_point_externals("mosaic", MOSAIC_ENTRYPOINTS)
