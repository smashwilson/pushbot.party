workflow "Publish" {
  on = "push"
  resolves = "Build GitHub page"
}

action "Only on master" {
  uses = "actions/bin/filter@master"
  args = "branch master"
}

action "Build GitHub page" {
  uses = "./actions/publish"
  needs = "Only on master"
  secrets = [ "DEPLOY_KEY" ]
}
