#!/usr/bin/env sh

# npm v11 no longer supports legacy env configs like `devdir`.
unset npm_config_devdir NPM_CONFIG_DEVDIR
unset npm_config_min_release_age NPM_CONFIG_MIN_RELEASE_AGE

set_npmrc_by_registry() {
    case "$1" in
        *p4nr-nodejs-beta*|*p4nrbeta*)
            echo "Using Beta npmrc from registry config"
            cp .npmrcbeta ~/.npmrc
            cp -f .npmrcbeta .npmrc
            node overwriteRegistryConfigForBeta.js
            ;;
        *p4nr-nodejs-rc*|*p4nrrc*)
            echo "Using RC npmrc from registry config"
            cp .npmrcrc ~/.npmrc
            cp -f .npmrcrc .npmrc
            node overwriteRegistryConfigForRC.js
            ;;
        *p4nr-nodejs-ci*|*p4nrci*)
            echo "Using CI npmrc from registry config"
            cp .npmrcci ~/.npmrc
            cp -f .npmrcci .npmrc
            node overwriteRegistryConfigForBuild.js
            ;;
        *p4nr-nodejs*|*p4nr*)
            echo "Using production npmrc from registry config"
            cp .npmrcmain ~/.npmrc
            cp -f .npmrcmain .npmrc
            node overwriteRegistryConfigForRelease.js
            ;;
        *)
            echo "Unknown registry, using default Beta npmrc"
            cp .npmrcbeta ~/.npmrc
            cp -f .npmrcbeta .npmrc
            ;;
    esac
}

set_beta_npmrc() {
    echo "Using default Beta npmrc"
    cp .npmrcbeta ~/.npmrc
    cp -f .npmrcbeta .npmrc
    node overwriteRegistryConfigForBeta.js
}

check_registry() {
    REGISTRY=$(node -p "require('./package.json').publishConfig?.registry || ''")
    if [ -n "$REGISTRY" ]; then
        set_npmrc_by_registry "$REGISTRY"
    else
        echo "No registry config found, using default Beta npmrc"
        set_beta_npmrc
    fi
}

if command -v git >/dev/null 2>&1 && git rev-parse --git-dir >/dev/null 2>&1; then
    if [ -n "$DRONE_TAG" ]; then
        current_tag="$DRONE_TAG"
    else
        current_tag=$(git describe --tags --exact-match HEAD 2>/dev/null || git describe --tags --exact-match FETCH_HEAD 2>/dev/null)
    fi

    if [ -n "$current_tag" ]; then
        echo "On tag: $current_tag"
        case "$current_tag" in
            v*.*.*-beta.*)
                echo "Using Beta npmrc from git tag"
                cp .npmrcbeta ~/.npmrc
                cp -f .npmrcbeta .npmrc
                node overwriteRegistryConfigForBeta.js
                ;;
            v*.*.*-rc.*)
                echo "Using RC npmrc from git tag"
                cp .npmrcrc ~/.npmrc
                cp -f .npmrcrc .npmrc
                node overwriteRegistryConfigForRC.js
                ;;
            v*.*.*-release|v*.*.*-hotfix.*)
                echo "Using production npmrc from git tag"
                cp .npmrcmain ~/.npmrc
                cp -f .npmrcmain .npmrc
                node overwriteRegistryConfigForRelease.js
                ;;
            *)
                echo "Unknown tag format: $current_tag, falling back to registry check"
                check_registry
                ;;
        esac
    else
        current_branch="$DRONE_BRANCH"
        if [ -z "$current_branch" ]; then
            current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
        fi

        if [ -n "$current_branch" ]; then
            echo "On branch: $current_branch"
            case "$current_branch" in
                "develop"|"development"|feature/*)
                    echo "Using development npmrc from git branch"
                    cp .npmrcbeta ~/.npmrc
                    cp -f .npmrcbeta .npmrc
                    node overwriteRegistryConfigForBeta.js
                    ;;
                "main"|"master"|hotfix/*)
                    echo "Using production npmrc from git branch"
                    cp .npmrcmain ~/.npmrc
                    cp -f .npmrcmain .npmrc
                    node overwriteRegistryConfigForRelease.js
                    ;;
                release/*)
                    echo "Using Release Candidate npmrc from git branch"
                    cp .npmrcrc ~/.npmrc
                    cp -f .npmrcrc .npmrc
                    node overwriteRegistryConfigForRC.js
                    ;;
                *)
                    echo "Branch not configured, falling back to registry check"
                    check_registry
                    ;;
            esac
        else
            echo "Could not determine branch, falling back to registry check"
            check_registry
        fi
    fi
else
    echo "Git not available, falling back to registry check"
    check_registry
fi

node -v
npm cache verify