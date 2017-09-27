#!/usr/bin/env bash

MVN_VERSION=$(mvn org.apache.maven.plugins:maven-help-plugin:2.1.1:evaluate -Dexpression=project.version | grep -v "\[")
VERSION_TAG="v$MVN_VERSION"

git diff --exit-code --stat $VERSION_TAG

DIFF_STATUS=$?

if [ $DIFF_STATUS != 0 ]; then
    echo
    (>&2 echo "ERROR: Tagged version $VERSION_TAG must match the maven version without any diff to be published")
    exit $DIFF_STATUS
fi

atlas-mvn deploy
