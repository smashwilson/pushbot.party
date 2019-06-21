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
  env = {
    REACT_APP_API_BASE_URL = "https://api.pushbot.party"
    REACT_APP_API_AUTH_TYPE = "slack"
  }
}
