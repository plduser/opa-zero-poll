package policies

default allow = false

allow {
    input.action == "ping"
}
