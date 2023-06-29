## Cloudflare WAF rules against spam

95.217.118.106 is a bot pinging for void event

```
((ip.geoip.asnum in {206766 196955 14618 210558 210107 29632 16276 24940 14061 213230}) or (http.user_agent contains "Google-Read-Aloud") or (ip.src in $idiots)) and not http.host in {"matrix.pixelplanet.fun:443" "matrix.pixelplanet.fun" "matrix.pixelplanet.fun:80" "git.pixelplanet.fun" "git.pixelplanet.fun:80" "git.pixelplanet.fun:443"} and not http.request.uri.path contains "/.well-known/" and ip.src ne 95.217.118.106
```

## Google crap

```
(ip.geoip.asnum eq 15169 and http.request.uri ne "/" and http.request.uri ne "" and not http.request.uri contains "/assets")
```
