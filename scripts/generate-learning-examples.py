#!/usr/bin/env python3
"""Generate numbered learning-path example flows (examples-learning-path APPROVE)."""
import json
import uuid
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "examples"


def nid():
    return uuid.uuid4().hex[:16]


def client(cid, z, name, port, serial=False, serial_port="/dev/ttyUSB0"):
    """Flow-scoped config (z=tab id) so deleting the tab removes the client."""
    return {
        "id": cid,
        "type": "modbus-client",
        "z": z,
        "name": name,
        "clienttype": "serial" if serial else "tcp",
        "bufferCommands": True,
        "stateLogEnabled": False,
        "queueLogEnabled": False,
        "failureLogEnabled": True,
        "tcpHost": "127.0.0.1",
        "tcpPort": str(port if not serial else 502),
        "tcpType": "DEFAULT",
        "serialPort": serial_port,
        "serialType": "RTU-BUFFERD",
        "serialBaudrate": "9600",
        "serialDatabits": "8",
        "serialStopbits": "1",
        "serialParity": "none",
        "serialConnectionDelay": "100",
        "serialAsciiResponseStartDelimiter": "0x3A",
        "unit_id": "1",
        "commandDelay": "1",
        "clientTimeout": "1000",
        "reconnectOnTimeout": True,
        "reconnectTimeout": "2000",
        "parallelUnitIdsAllowed": True,
    }


def server(sid, z, port, name="", x=120, y=80):
    return {
        "id": sid,
        "type": "modbus-server",
        "z": z,
        "name": name,
        "logEnabled": False,
        "hostname": "127.0.0.1",
        "serverPort": str(port),
        "responseDelay": 100,
        "delayUnit": "ms",
        "coilsBufferSize": 10000,
        "holdingBufferSize": 10000,
        "inputBufferSize": 10000,
        "discreteBufferSize": 10000,
        "showErrors": False,
        "showStatusActivities": False,
        "x": x,
        "y": y,
        "wires": [[], [], [], [], []],
    }


def comment(z, text, x=200, y=40, name=None):
    return {
        "id": nid(),
        "type": "comment",
        "z": z,
        "name": (name or text.split("\n")[0])[:60],
        "info": text,
        "x": x,
        "y": y,
        "wires": [],
    }


def guide(title, features, config, howto, port=None, extra=None):
    """Structured in-flow teaching text (tab info + comment node)."""
    lines = [
        title.strip(),
        "",
        "FEATURES IN THIS FLOW",
        *[f"- {f}" for f in features],
        "",
        "WHAT THE CONFIG DOES",
        *[f"- {c}" for c in config],
        "",
        "HOW TO RUN",
        *[f"{i}) {h}" for i, h in enumerate(howto, 1)],
    ]
    if port is not None:
        lines.extend(["", f"Demo TCP port: {port}"])
    if extra:
        lines.extend(["", extra.strip()])
    lines.append(
        "\nConfig nodes are flow-scoped: delete this tab to remove client/IO config."
    )
    return "\n".join(lines)


def tab(tid, label, info=""):
    return {
        "id": tid,
        "type": "tab",
        "label": label,
        "disabled": False,
        "info": info,
    }


def response(rid, z, x, y, name=""):
    """One Modbus-Response per data source — shared status is hard to read at fast poll rates."""
    return {
        "id": rid,
        "type": "modbus-response",
        "z": z,
        "name": name,
        "registerShowMax": 20,
        "x": x,
        "y": y,
        "wires": [],
    }


def debug_node(did, z, name, x, y, complete="payload"):
    """Sidebar debug so learners can see msg.payload with their eyes."""
    return {
        "id": did,
        "type": "debug",
        "z": z,
        "name": name,
        "active": True,
        "tosidebar": True,
        "console": False,
        "tostatus": False,
        "complete": complete,
        "x": x,
        "y": y,
        "wires": [],
    }


_PRODUCERS = {
    "modbus-read",
    "modbus-getter",
    "modbus-flex-getter",
    "modbus-write",
    "modbus-flex-write",
    "modbus-flex-sequencer",
    "modbus-flex-fc",
    "modbus-queue-info",
}

# Approximate editor footprints (centre-based coordinates in Node-RED)
_FOOTPRINT = {
    "comment": (280, 48),
    "modbus-server": (160, 60),
    "modbus-response": (140, 50),
    "modbus-response-filter": (160, 50),
    "debug": (160, 40),
    "inject": (140, 40),
    "function": (140, 40),
    "http in": (140, 40),
    "http response": (140, 40),
}


def _size(n):
    return _FOOTPRINT.get(n.get("type"), (150, 46))


def _overlap(a, b, pad=16):
    aw, ah = _size(a)
    bw, bh = _size(b)
    return abs(a["x"] - b["x"]) < (aw + bw) / 2 - pad and abs(a["y"] - b["y"]) < (
        ah + bh
    ) / 2 - pad


def ensure_see_debug(nodes):
    """Attach Debug on data output; place clear of Response and other targets."""
    by_id = {n["id"]: n for n in nodes}
    tab = next((n for n in nodes if n.get("type") == "tab"), None)
    if not tab:
        return nodes
    extras = []
    for n in list(nodes):
        if n.get("type") not in _PRODUCERS:
            continue
        wires = n.get("wires") or []
        wires0 = list((wires[0] if len(wires) > 0 else []) or [])
        wires1 = list((wires[1] if len(wires) > 1 else []) or [])
        if any(by_id.get(w, {}).get("type") == "debug" for w in wires0):
            continue

        resp = None
        for wid in wires1 + wires0:
            t = by_id.get(wid)
            if t and t.get("type") == "modbus-response":
                resp = t
                break

        did = nid()
        label = "SEE: " + (n.get("name") or n.get("type"))
        px, py = int(n.get("x") or 400), int(n.get("y") or 200)
        others0 = [by_id[w] for w in wires0 if w in by_id]

        if resp:
            dx = int(resp.get("x") or (px + 280))
            # Keep response on lower lane; SEE on upper lane (same column)
            resp["x"] = dx
            resp["y"] = py + 80
            dbg = debug_node(did, tab["id"], label, dx, py - 80)
        elif others0:
            # Data already goes to function/etc. — put SEE above that column
            ox = max(int(t.get("x") or px) for t in others0)
            dbg = debug_node(did, tab["id"], label, ox, py - 80)
        else:
            dbg = debug_node(did, tab["id"], label, px + 280, py)

        extras.append(dbg)
        by_id[did] = dbg
        if not n.get("wires"):
            n["wires"] = [[], []]
        while len(n["wires"]) < 1:
            n["wires"].append([])
        n["wires"][0] = list(n["wires"][0] or []) + [did]
    return nodes + extras


def declutter(nodes):
    """Nudge overlapping visible nodes so nothing covers another."""
    visual = [
        n
        for n in nodes
        if n.get("type")
        not in ("tab", "modbus-client", "modbus-io-config")
        and "x" in n
        and "y" in n
    ]
    # Stable order: top-to-bottom, left-to-right
    visual.sort(key=lambda n: (n["y"], n["x"], n["id"]))
    changed = True
    guard = 0
    while changed and guard < 80:
        changed = False
        guard += 1
        for i, a in enumerate(visual):
            for b in visual[i + 1 :]:
                if not _overlap(a, b):
                    continue
                # Push the lower / righter node further down (prefer vertical lane)
                if b["y"] >= a["y"]:
                    bw, bh = _size(b)
                    aw, ah = _size(a)
                    b["y"] = int(a["y"] + (ah + bh) / 2 + 24)
                else:
                    aw, ah = _size(a)
                    bw, bh = _size(b)
                    a["y"] = int(b["y"] + (ah + bh) / 2 + 24)
                changed = True
    return nodes


def build():
    flows = {}

    # 01
    z, cid, sid = nid(), nid(), nid()
    rid, wid, resp_w, resp_r, inj_w = nid(), nid(), nid(), nid(), nid()
    text = guide(
        "LEARN: Modbus memory areas and function codes",
        features=[
            "Local Modbus-Server (TCP slave buffers) + Modbus-Client",
            "Modbus-Write (FC6 Holding) and Modbus-Read (FC3)",
            "One Modbus-Response per data source (status stays readable)",
        ],
        config=[
            "Client tcpHost/tcpPort → must match Server hostname/serverPort",
            "Write dataType + adr + quantity → which FC and address to write",
            "Read dataType HoldingRegister + adr/quantity → FC3 range to poll",
            "Unit ID on client/nodes → slave id (TCP demos use 1)",
        ],
        howto=[
            "Deploy and wait until the client is active",
            "Click inject Write 42 to HR0",
            "Watch each node's own Modbus-Response status",
        ],
        port=10502,
        extra="""Areas (common mapping):
- Coils (R/W bits)           FC1 read / FC5, FC15 write
- Discrete Inputs (R bits)   FC2 read
- Holding Registers (R/W)    FC3 read / FC6, FC16 write
- Input Registers (R)        FC4 read

Addresses in this package are 0-based (address 0 = first register).""",
    )
    flows["01-Modbus-Basics-Registers-And-FCs.json"] = [
        tab(z, "01 Modbus Basics", text),
        comment(z, text),
        server(sid, z, 10502, "Basics Server", 140, 220),
        client(cid, z, "Basics Client", 10502),
        {
            "id": inj_w,
            "type": "inject",
            "z": z,
            "name": "Write 42 to HR0",
            "props": [{"p": "payload"}],
            "repeat": "",
            "crontab": "",
            "once": False,
            "topic": "",
            "payload": "42",
            "payloadType": "num",
            "x": 160,
            "y": 340,
            "wires": [[wid]],
        },
        {
            "id": wid,
            "type": "modbus-write",
            "z": z,
            "name": "FC6 Holding",
            "showStatusActivities": True,
            "showErrors": True,
            "showWarnings": True,
            "unitid": "1",
            "dataType": "HoldingRegister",
            "adr": "0",
            "quantity": "1",
            "server": cid,
            "emptyMsgOnFail": False,
            "keepMsgProperties": False,
            "x": 400,
            "y": 340,
            "wires": [[], [resp_w]],
        },
        {
            "id": rid,
            "type": "modbus-read",
            "z": z,
            "name": "Poll FC3",
            "topic": "",
            "showStatusActivities": True,
            "logIOActivities": False,
            "showErrors": True,
            "showWarnings": True,
            "unitid": "1",
            "dataType": "HoldingRegister",
            "adr": "0",
            "quantity": "2",
            "rate": "2",
            "rateUnit": "s",
            "delayOnStart": True,
            "startDelayTime": "1",
            "server": cid,
            "useIOFile": False,
            "ioFile": "",
            "useIOForPayload": False,
            "emptyMsgOnFail": False,
            "keepMsgProperties": False,
            "x": 380,
            "y": 440,
            "wires": [[], [resp_r]],
        },
        response(resp_w, z, 640, 340, "Write response"),
        response(resp_r, z, 640, 440, "Read response"),
    ]

    # 02
    z, cid, sid = nid(), nid(), nid()
    rid, resp_id = nid(), nid()
    text = guide(
        "GETTING STARTED: first TCP client + server + poll",
        features=[
            "Modbus-Server as local demo slave",
            "Modbus-Client (TCP) as shared connection config",
            "Modbus-Read polling Holding Registers (FC3)",
            "Modbus-Response showing live register values on node status",
        ],
        config=[
            "Server serverPort 10503 → TCP listen port",
            "Client tcpPort 10503 → must match server",
            "Read rate/rateUnit → poll interval (here 1 s)",
            "delayOnStart / startDelayTime → wait before first poll after deploy",
            "useIOFile=false → raw numeric payload (no named IO mapping)",
        ],
        howto=[
            "Deploy this tab alone (or keep ports unique vs other examples)",
            "Wait until Modbus-Client shows active / reading",
            "Watch Modbus-Response status for Holding Register values",
        ],
        port=10503,
    )
    flows["02-Getting-Started-Client-And-Server.json"] = [
        tab(z, "02 Getting Started", text),
        comment(z, text),
        server(sid, z, 10503, "Demo Server", 140, 200),
        client(cid, z, "Demo Client", 10503),
        {
            "id": rid,
            "type": "modbus-read",
            "z": z,
            "name": "Read HR",
            "topic": "hr",
            "showStatusActivities": True,
            "logIOActivities": False,
            "showErrors": True,
            "showWarnings": True,
            "unitid": "1",
            "dataType": "HoldingRegister",
            "adr": "0",
            "quantity": "4",
            "rate": "1",
            "rateUnit": "s",
            "delayOnStart": True,
            "startDelayTime": "1",
            "server": cid,
            "useIOFile": False,
            "ioFile": "",
            "useIOForPayload": False,
            "emptyMsgOnFail": False,
            "keepMsgProperties": False,
            "x": 380,
            "y": 280,
            "wires": [[], [resp_id]],
        },
        response(resp_id, z, 600, 280),
    ]

    # 03
    z, cid, sid = nid(), nid(), nid()
    r1, r2, resp1, resp2 = nid(), nid(), nid(), nid()
    text = guide(
        "NODE: Modbus-Read (interval polling)",
        features=[
            "Periodic FC1–4 reads without an inject input",
            "Two readers: Holding Registers (FC3) and Coils (FC1)",
            "Dedicated Modbus-Response per reader",
        ],
        config=[
            "dataType → Coil / Input / HoldingRegister / InputRegister (FC1–4)",
            "adr + quantity → start address and count (0-based)",
            "rate + rateUnit → poll interval",
            "delayOnStart → avoid racing the server right after deploy",
            "unitid → override Unit ID for this node (blank = client default)",
            "showStatusActivities / showErrors / showWarnings → UI + logging",
        ],
        howto=[
            "Deploy and wait ~1–2 s",
            "Compare FC3 vs FC1 Modbus-Response status panes",
            "Change quantity or rate and redeploy to see the effect",
        ],
        port=10504,
    )
    flows["03-Node-Read-Polling.json"] = [
        tab(z, "03 Modbus-Read", text),
        comment(z, text),
        server(sid, z, 10504, "", 120, 200),
        client(cid, z, "Read Client", 10504),
        {
            "id": r1,
            "type": "modbus-read",
            "z": z,
            "name": "FC3 Holding",
            "topic": "",
            "showStatusActivities": True,
            "logIOActivities": False,
            "showErrors": True,
            "showWarnings": True,
            "unitid": "1",
            "dataType": "HoldingRegister",
            "adr": "0",
            "quantity": "4",
            "rate": "1",
            "rateUnit": "s",
            "delayOnStart": True,
            "startDelayTime": "1",
            "server": cid,
            "useIOFile": False,
            "ioFile": "",
            "useIOForPayload": False,
            "emptyMsgOnFail": False,
            "keepMsgProperties": False,
            "x": 360,
            "y": 260,
            "wires": [[], [resp1]],
        },
        {
            "id": r2,
            "type": "modbus-read",
            "z": z,
            "name": "FC1 Coils",
            "topic": "",
            "showStatusActivities": True,
            "logIOActivities": False,
            "showErrors": True,
            "showWarnings": True,
            "unitid": "1",
            "dataType": "Coil",
            "adr": "0",
            "quantity": "8",
            "rate": "2",
            "rateUnit": "s",
            "delayOnStart": True,
            "startDelayTime": "1",
            "server": cid,
            "useIOFile": False,
            "ioFile": "",
            "useIOForPayload": False,
            "emptyMsgOnFail": False,
            "keepMsgProperties": False,
            "x": 360,
            "y": 380,
            "wires": [[], [resp2]],
        },
        response(resp1, z, 600, 260, "FC3 response"),
        response(resp2, z, 600, 380, "FC1 response"),
    ]

    # 04
    z, cid, sid = nid(), nid(), nid()
    gid, resp_id, inj = nid(), nid(), nid()
    text = guide(
        "NODE: Modbus-Getter (on-demand read)",
        features=[
            "FC1–4 read only when an input message arrives",
            "Address / quantity fixed in the node editor (not in msg.payload)",
            "Useful for HTTP triggers, UI buttons, and event-driven flows",
        ],
        config=[
            "dataType / adr / quantity / unitid → same meaning as Modbus-Read",
            "No rate field → timing comes from upstream inject / HTTP / etc.",
            "emptyMsgOnFail → optional empty message on error",
            "keepMsgProperties → keep topic and other msg fields through the read",
        ],
        howto=[
            "Deploy",
            "Click Trigger read",
            "Inspect Modbus-Response and optional Debug on output 1",
        ],
        port=10505,
    )
    flows["04-Node-Getter-On-Demand.json"] = [
        tab(z, "04 Modbus-Getter", text),
        comment(z, text),
        server(sid, z, 10505, "", 120, 200),
        client(cid, z, "Getter Client", 10505),
        {
            "id": inj,
            "type": "inject",
            "z": z,
            "name": "Trigger read",
            "props": [{"p": "payload"}],
            "repeat": "",
            "crontab": "",
            "once": False,
            "topic": "",
            "payload": "",
            "payloadType": "date",
            "x": 160,
            "y": 300,
            "wires": [[gid]],
        },
        {
            "id": gid,
            "type": "modbus-getter",
            "z": z,
            "name": "Get HR",
            "showStatusActivities": True,
            "showErrors": True,
            "showWarnings": True,
            "logIOActivities": False,
            "unitid": "1",
            "dataType": "HoldingRegister",
            "adr": "0",
            "quantity": "4",
            "server": cid,
            "useIOFile": False,
            "ioFile": "",
            "useIOForPayload": False,
            "emptyMsgOnFail": False,
            "keepMsgProperties": False,
            "x": 380,
            "y": 300,
            "wires": [[], [resp_id]],
        },
        response(resp_id, z, 600, 300),
    ]

    # 05
    z, cid, sid = nid(), nid(), nid()
    fg, resp_id, inj1, inj2, fn1, fn2 = nid(), nid(), nid(), nid(), nid(), nid()
    text = guide(
        "NODE: Modbus-Flex-Getter (dynamic read)",
        features=[
            "FC / address / quantity / unit id come from msg.payload each time",
            "Same node can issue FC3 Holding and FC1 Coils in one flow",
            "Both unitId and unitid accepted (v5.46+)",
        ],
        config=[
            "Node editor mainly selects the Modbus-Client",
            "msg.payload shape: { fc, unitid|unitId, address, quantity }",
            "useIOFile / useIOForPayload → optional named IO mapping (see example 11)",
            "keepMsgProperties → correlation fields survive the round-trip",
        ],
        howto=[
            "Deploy",
            "Click FC3 qty 4 → read Holding Registers",
            "Click FC1 coils → read coils with a different payload",
            "Edit the Function nodes to change address/quantity at runtime",
        ],
        port=10506,
    )
    flows["05-Node-Flex-Getter-Dynamic.json"] = [
        tab(z, "05 Flex-Getter", text),
        comment(z, text),
        server(sid, z, 10506, "", 120, 200),
        client(cid, z, "Flex-Getter Client", 10506),
        {
            "id": inj1,
            "type": "inject",
            "z": z,
            "name": "FC3 qty 4",
            "props": [{"p": "payload"}],
            "repeat": "",
            "crontab": "",
            "once": False,
            "topic": "",
            "payload": "",
            "payloadType": "date",
            "x": 150,
            "y": 280,
            "wires": [[fn1]],
        },
        {
            "id": fn1,
            "type": "function",
            "z": z,
            "name": "Build FC3",
            "func": "msg.payload = { fc: 3, unitid: 1, address: 0, quantity: 4 };\nreturn msg;",
            "outputs": 1,
            "noerr": 0,
            "x": 340,
            "y": 280,
            "wires": [[fg]],
        },
        {
            "id": inj2,
            "type": "inject",
            "z": z,
            "name": "FC1 coils",
            "props": [{"p": "payload"}],
            "repeat": "",
            "crontab": "",
            "once": False,
            "topic": "",
            "payload": "",
            "payloadType": "date",
            "x": 150,
            "y": 360,
            "wires": [[fn2]],
        },
        {
            "id": fn2,
            "type": "function",
            "z": z,
            "name": "Build FC1",
            "func": "msg.payload = { fc: 1, unitid: 1, address: 0, quantity: 8 };\nreturn msg;",
            "outputs": 1,
            "noerr": 0,
            "x": 340,
            "y": 360,
            "wires": [[fg]],
        },
        {
            "id": fg,
            "type": "modbus-flex-getter",
            "z": z,
            "name": "",
            "showStatusActivities": True,
            "showErrors": True,
            "showWarnings": True,
            "logIOActivities": False,
            "server": cid,
            "useIOFile": False,
            "ioFile": "",
            "useIOForPayload": False,
            "emptyMsgOnFail": False,
            "keepMsgProperties": True,
            "delayOnStart": False,
            "startDelayTime": "",
            "x": 560,
            "y": 320,
            "wires": [[], [resp_id]],
        },
        response(resp_id, z, 780, 320),
    ]

    # 06
    z, cid, sid = nid(), nid(), nid()
    w, fw, resp_w, resp_fw, inj_w, inj_fw, fn_fw = (
        nid(),
        nid(),
        nid(),
        nid(),
        nid(),
        nid(),
        nid(),
    )
    text = guide(
        "NODE: Modbus-Write and Modbus-Flex-Write",
        features=[
            "Modbus-Write: fixed FC in editor; msg.payload is the value",
            "Modbus-Flex-Write: FC/address/quantity/value all from msg.payload",
            "Separate Modbus-Response per writer",
        ],
        config=[
            "Write dataType HoldingRegister + quantity 1 → FC6 single register",
            "Write Coil / multiple → FC5 / FC15 (payload bool or array)",
            "Flex-Write payload: { value, fc, unitid, address, quantity }",
            "FC16 with quantity 1 needs value: [n] (array), not a bare number",
            "emptyMsgOnFail / keepMsgProperties → error and correlation behaviour",
        ],
        howto=[
            "Deploy",
            "Click Write 7 (FC6) → single Holding Register 0 = 7",
            "Click Flex FC16 → writes [10,20,30] starting at address 0",
            "Read back with example 03/05 or watch Response status",
        ],
        port=10507,
    )
    flows["06-Node-Write-And-Flex-Write.json"] = [
        tab(z, "06 Write / Flex-Write", text),
        comment(z, text),
        server(sid, z, 10507, "", 120, 200),
        client(cid, z, "Write Client", 10507),
        {
            "id": inj_w,
            "type": "inject",
            "z": z,
            "name": "Write 7 (FC6)",
            "props": [{"p": "payload"}],
            "repeat": "",
            "crontab": "",
            "once": False,
            "topic": "",
            "payload": "7",
            "payloadType": "num",
            "x": 160,
            "y": 280,
            "wires": [[w]],
        },
        {
            "id": w,
            "type": "modbus-write",
            "z": z,
            "name": "FC6",
            "showStatusActivities": True,
            "showErrors": True,
            "showWarnings": True,
            "unitid": "1",
            "dataType": "HoldingRegister",
            "adr": "0",
            "quantity": "1",
            "server": cid,
            "emptyMsgOnFail": False,
            "keepMsgProperties": False,
            "x": 380,
            "y": 280,
            "wires": [[], [resp_w]],
        },
        {
            "id": inj_fw,
            "type": "inject",
            "z": z,
            "name": "Flex FC16",
            "props": [{"p": "payload"}],
            "repeat": "",
            "crontab": "",
            "once": False,
            "topic": "",
            "payload": "",
            "payloadType": "date",
            "x": 150,
            "y": 400,
            "wires": [[fn_fw]],
        },
        {
            "id": fn_fw,
            "type": "function",
            "z": z,
            "name": "Build FC16",
            "func": "msg.payload = { value: [10, 20, 30], fc: 16, unitid: 1, address: 0, quantity: 3 };\nreturn msg;",
            "outputs": 1,
            "noerr": 0,
            "x": 360,
            "y": 400,
            "wires": [[fw]],
        },
        {
            "id": fw,
            "type": "modbus-flex-write",
            "z": z,
            "name": "",
            "showStatusActivities": True,
            "showErrors": True,
            "showWarnings": True,
            "server": cid,
            "emptyMsgOnFail": False,
            "keepMsgProperties": True,
            "x": 580,
            "y": 400,
            "wires": [[], [resp_fw]],
        },
        response(resp_w, z, 640, 280, "FC6 response"),
        response(resp_fw, z, 800, 400, "FC16 response"),
    ]

    # 07
    z, cid, sid = nid(), nid(), nid()
    seq, resp_id, inj = nid(), nid(), nid()
    text = guide(
        "NODE: Modbus-Flex-Sequencer",
        features=[
            "Runs an ordered list of FC1–4 reads on each trigger",
            "Useful for multi-range polls without wiring many Read nodes",
        ],
        config=[
            "sequences (editor) → list of {fc, unitid, address, quantity}",
            "delayOnStart → wait before accepting first trigger after deploy",
            "emptyMsgOnFail / keepMsgProperties → failure and correlation behaviour",
            "Client Queue Commands → recommended when sequences are long",
        ],
        howto=[
            "Deploy",
            "Click Run sequence",
            "Inspect Modbus-Response for each step's results on the outputs",
            "Edit the sequence in the node to add another address range",
        ],
        port=10508,
    )
    flows["07-Node-Flex-Sequencer.json"] = [
        tab(z, "07 Flex-Sequencer", text),
        comment(z, text),
        server(sid, z, 10508, "", 120, 200),
        client(cid, z, "Sequencer Client", 10508),
        {
            "id": inj,
            "type": "inject",
            "z": z,
            "name": "Run sequence",
            "props": [{"p": "payload"}],
            "repeat": "5",
            "crontab": "",
            "once": True,
            "onceDelay": 1,
            "topic": "",
            "payload": "",
            "payloadType": "date",
            "x": 180,
            "y": 300,
            "wires": [[seq]],
        },
        {
            "id": seq,
            "type": "modbus-flex-sequencer",
            "z": z,
            "name": "",
            "sequences": [
                {
                    "name": "coils",
                    "unitid": "1",
                    "fc": "FC1",
                    "address": "0",
                    "quantity": "4",
                },
                {
                    "name": "holding",
                    "unitid": "1",
                    "fc": "FC3",
                    "address": "0",
                    "quantity": "4",
                },
                {
                    "name": "input",
                    "unitid": "1",
                    "fc": "FC4",
                    "address": "0",
                    "quantity": "2",
                },
            ],
            "server": cid,
            "showStatusActivities": True,
            "showErrors": True,
            "showWarnings": True,
            "logIOActivities": False,
            "useIOFile": False,
            "ioFile": "",
            "useIOForPayload": False,
            "emptyMsgOnFail": True,
            "keepMsgProperties": True,
            "delayOnStart": True,
            "startDelayTime": "1",
            "x": 420,
            "y": 300,
            "wires": [[], [resp_id]],
        },
        response(resp_id, z, 660, 300),
    ]

    # 08
    z, cid, sid = nid(), nid(), nid()
    fc, resp_id, inj = nid(), nid(), nid()
    text = guide(
        "NODE: Modbus-Flex-FC (custom / mapped function codes)",
        features=[
            "Build non-default or vendor FC request/response layouts",
            "Argument maps loaded from extras/argumentMaps/",
            "requestCard / responseCard define field offsets and types",
        ],
        config=[
            "mapPath → FC map JSON file (relative paths fall back to the package, defaults shipped in extras/)",
            "selectedFc → which map entry to use",
            "requestCard fields → values sent in the PDU",
            "responseCard fields → how the reply buffer is decoded",
            "If relative mapPath fails, set absolute path under node_modules/…/extras/argumentMaps/",
        ],
        howto=[
            "Deploy (ensure mapPath resolves — see ArgumentMaps.md)",
            "Click Trigger FC map",
            "Inspect Modbus-Response / msg for decoded fields",
            "Open extras/argumentMaps/ArgumentMaps.md to add your own map",
        ],
        port=10509,
        extra="Docs: extras/argumentMaps/ArgumentMaps.md",
    )
    flows["08-Node-Flex-FC-Custom-Maps.json"] = [
        tab(z, "08 Flex-FC", text),
        comment(z, text),
        server(sid, z, 10509, "", 120, 220),
        client(cid, z, "Flex-FC Client", 10509),
        {
            "id": inj,
            "type": "inject",
            "z": z,
            "name": "Trigger FC map",
            "props": [{"p": "payload"}],
            "repeat": "",
            "crontab": "",
            "once": False,
            "topic": "",
            "payload": "",
            "payloadType": "date",
            "x": 180,
            "y": 320,
            "wires": [[fc]],
        },
        {
            "id": fc,
            "type": "modbus-flex-fc",
            "z": z,
            "name": "Mapped FC03",
            "showStatusActivities": True,
            "showErrors": True,
            "showWarnings": True,
            "unitid": "1",
            "server": cid,
            "emptyMsgOnFail": False,
            "keepMsgProperties": False,
            "mapPath": "./extras/argumentMaps/defaults/codes.json",
            "selectedFc": "bdd84caa-4191-11ee-989f-4384dc45e6c3",
            "fc": "0x03",
            "requestCard": [
                {
                    "name": "startingAddress",
                    "data": 0,
                    "offset": 0,
                    "type": "uint16be",
                },
                {
                    "name": "quantityRegisters",
                    "data": 2,
                    "offset": 2,
                    "type": "uint16be",
                },
            ],
            "responseCard": [
                {"name": "byteCount", "data": 0, "offset": 0, "type": "uint8be"},
                {
                    "name": "HoldingRegisterValue",
                    "data": 0,
                    "offset": 1,
                    "type": "uint16be",
                },
            ],
            "lastSelectedFc": "bdd84caa-4191-11ee-989f-4384dc45e6c3",
            "x": 420,
            "y": 320,
            "wires": [[resp_id]],
        },
        response(resp_id, z, 660, 320),
    ]

    # 09
    z = nid()
    cid = nid()
    s1, s2 = nid(), nid()
    conn, inj1, inj2, fn1, fn2, rd, resp_id = (
        nid(),
        nid(),
        nid(),
        nid(),
        nid(),
        nid(),
        nid(),
    )
    text = guide(
        "NODE: Modbus-Flex-Connector (runtime endpoint switch)",
        features=[
            "Reconnect the shared Modbus-Client to another TCP (or serial) endpoint at runtime",
            "Two local Modbus-Servers (A=10510, B=10511) to demonstrate switching",
            "Ongoing Modbus-Read continues against whichever endpoint is active",
        ],
        config=[
            "Client starts on Server A (tcpPort 10510)",
            "Flex-Connector msg.payload: { connectorType:'TCP', tcpHost, tcpPort }",
            "Serial switch uses connectorType SERIAL + serial* fields (not shown here)",
            "Read node keeps using the same client config — only the socket target changes",
        ],
        howto=[
            "Deploy both servers",
            "Click Switch → Server A, then Switch → Server B",
            "Watch client status and Read response while switching",
        ],
        port="10510 / 10511",
    )
    flows["09-Node-Flex-Connector-Runtime-Switch.json"] = [
        tab(z, "09 Flex-Connector", text),
        comment(z, text),
        server(s1, z, 10510, "Server A", 120, 200),
        server(s2, z, 10511, "Server B", 120, 280),
        client(cid, z, "Switchable Client", 10510),
        {
            "id": inj1,
            "type": "inject",
            "z": z,
            "name": "Connect A :10510",
            "props": [{"p": "payload"}],
            "repeat": "",
            "crontab": "",
            "once": True,
            "onceDelay": 0.5,
            "topic": "",
            "payload": "",
            "payloadType": "date",
            "x": 180,
            "y": 380,
            "wires": [[fn1]],
        },
        {
            "id": fn1,
            "type": "function",
            "z": z,
            "name": "TCP A",
            "func": "msg.payload = { connectorType: 'TCP', tcpHost: '127.0.0.1', tcpPort: 10510 };\nreturn msg;",
            "outputs": 1,
            "noerr": 0,
            "x": 400,
            "y": 380,
            "wires": [[conn]],
        },
        {
            "id": inj2,
            "type": "inject",
            "z": z,
            "name": "Connect B :10511",
            "props": [{"p": "payload"}],
            "repeat": "",
            "crontab": "",
            "once": False,
            "topic": "",
            "payload": "",
            "payloadType": "date",
            "x": 180,
            "y": 460,
            "wires": [[fn2]],
        },
        {
            "id": fn2,
            "type": "function",
            "z": z,
            "name": "TCP B",
            "func": "msg.payload = { connectorType: 'TCP', tcpHost: '127.0.0.1', tcpPort: 10511 };\nreturn msg;",
            "outputs": 1,
            "noerr": 0,
            "x": 400,
            "y": 460,
            "wires": [[conn]],
        },
        {
            "id": conn,
            "type": "modbus-flex-connector",
            "z": z,
            "name": "",
            "maxReconnectsPerMinute": 4,
            "emptyQueue": True,
            "showStatusActivities": True,
            "showErrors": True,
            "server": cid,
            "x": 620,
            "y": 420,
            "wires": [[]],
        },
        {
            "id": rd,
            "type": "modbus-read",
            "z": z,
            "name": "Poll active",
            "topic": "",
            "showStatusActivities": True,
            "logIOActivities": False,
            "showErrors": True,
            "showWarnings": True,
            "unitid": "1",
            "dataType": "HoldingRegister",
            "adr": "0",
            "quantity": "2",
            "rate": "1",
            "rateUnit": "s",
            "delayOnStart": True,
            "startDelayTime": "2",
            "server": cid,
            "useIOFile": False,
            "ioFile": "",
            "useIOForPayload": False,
            "emptyMsgOnFail": False,
            "keepMsgProperties": False,
            "x": 620,
            "y": 520,
            "wires": [[], [resp_id]],
        },
        response(resp_id, z, 840, 520),
    ]

    # 10
    z, cid, sid = nid(), nid(), nid()
    qi, fg, resp_id, inj, fn = nid(), nid(), nid(), nid(), nid()
    text = guide(
        "NODE: Modbus-Queue-Info (+ burst reads)",
        features=[
            "Shows command-queue depth for a Modbus-Client",
            "Burst Flex-Getter reads to fill the queue visibly",
            "Threshold levels for low / high queue warnings",
        ],
        config=[
            "Client bufferCommands (Queue Commands) → must be enabled for queuing",
            "queueReadIntervalTime → how often Queue-Info samples depth",
            "lowLowLevel / lowLevel / highLevel / highHighLevel → status thresholds",
            "updateOnAllQueueChanges → emit when depth changes",
            "errorOnHighLevel → raise node error when high threshold hit",
        ],
        howto=[
            "Deploy",
            "Click Burst reads (3 Flex-Getter FC3 requests)",
            "Watch Queue-Info status / output while the queue drains",
        ],
        port=10512,
    )
    flows["10-Node-Queue-Info-And-Multi-Device.json"] = [
        tab(z, "10 Queue-Info", text),
        comment(z, text),
        server(sid, z, 10512, "", 120, 200),
        client(cid, z, "Queue Client", 10512),
        {
            "id": inj,
            "type": "inject",
            "z": z,
            "name": "Burst reads",
            "props": [{"p": "payload"}],
            "repeat": "",
            "crontab": "",
            "once": False,
            "topic": "",
            "payload": "",
            "payloadType": "date",
            "x": 160,
            "y": 300,
            "wires": [[fn]],
        },
        {
            "id": fn,
            "type": "function",
            "z": z,
            "name": "3 reads",
            "func": (
                "const out = [];\n"
                "for (let i = 0; i < 3; i++) {\n"
                "  out.push({ payload: { fc: 3, unitid: 1, address: 0, quantity: 2 } });\n"
                "}\n"
                "return [out];\n"
            ),
            "outputs": 1,
            "noerr": 0,
            "x": 360,
            "y": 300,
            "wires": [[fg]],
        },
        {
            "id": fg,
            "type": "modbus-flex-getter",
            "z": z,
            "name": "",
            "showStatusActivities": True,
            "showErrors": True,
            "showWarnings": True,
            "logIOActivities": False,
            "server": cid,
            "useIOFile": False,
            "ioFile": "",
            "useIOForPayload": False,
            "emptyMsgOnFail": False,
            "keepMsgProperties": True,
            "delayOnStart": False,
            "startDelayTime": "",
            "x": 580,
            "y": 300,
            "wires": [[], [resp_id]],
        },
        {
            "id": qi,
            "type": "modbus-queue-info",
            "z": z,
            "name": "Queue",
            "topic": "",
            "unitid": "1",
            "queueReadIntervalTime": "500",
            "lowLowLevel": 1,
            "lowLevel": 5,
            "highLevel": 20,
            "highHighLevel": 50,
            "server": cid,
            "errorOnHighLevel": False,
            "showStatusActivities": True,
            "updateOnAllQueueChanges": True,
            "updateOnAllUnitQueues": False,
            "x": 560,
            "y": 400,
            "wires": [[]],
        },
        response(resp_id, z, 800, 300),
    ]

    # 11
    z, cid, sid = nid(), nid(), nid()
    io, filt, rd, resp_id, dbg_all, dbg_f = nid(), nid(), nid(), nid(), nid(), nid()
    inj, fn = nid(), nid()
    text = guide(
        "NODE: Modbus-IO-Config + Modbus-Response-Filter — named values",
        features=[
            "Give human-readable names to Modbus addresses via an IO JSON file",
            "Modbus-Read with useIOFile + useIOForPayload → payload = [{name, value, …}, …]",
            "Modbus-Response-Filter keeps only one named entry (by exact name string)",
            "Starter file extras/ioFileData/names-starter.json (easy to edit)",
            "Larger PLC-style sample still available: learning-device.json",
        ],
        config=[
            "IO-Config path → NDJSON file (one JSON object per line)",
            "IO-Config addressOffset → optional shift applied to all mappings",
            "Read useIOFile=true + ioFile=this config → apply name mapping",
            "Read useIOForPayload=true → msg.payload becomes named list (not raw ints)",
            "Read logIOActivities=true → debug mapping activity in Node-RED log",
            "Filter filter → exact name string from the IO file (e.g. iTemperature)",
            "Filter registers=0 → REQUIRED for named IO lists (do not use Modbus quantity)",
            "Filter filterResponseBuffer/Values/Input → strip heavy msg fields after filter",
        ],
        howto=[
            "Deploy (seed inject fills Holding Registers once)",
            "Open Debug → IO names (all): see iTemperature, iSetpoint, iCounter, …",
            "filtered name Debug shows only [{ name: 'iTemperature', value: 42, … }]",
            "Edit names-starter.json (add a line with type-prefix name), redeploy",
            "Change Filter name to match your new name and redeploy",
        ],
        port=10513,
        extra="""HOW TO MAINTAIN / PROVIDE NAMES (critical)

Edit (or copy) an IO file. Each line is one mapping:

  {"name":"iTemperature","valueAddress":"%IW0"}
  {"name":"iSetpoint","valueAddress":"%IW1"}
  {"name":"bMotorRunning","valueAddress":"%IX8.0"}

NAME PREFIX = DATA TYPE (first character of name is required!):
  i… Integer   w… Word   u… Unsigned   b… Boolean (with %Ix/%Qx)
  f…/r… Float/Real   d… Double   l… Long
Without a known prefix the mapping is SKIPPED → empty payload [].
Bad:  {"name":"temperature","valueAddress":"%IW0"}
Good: {"name":"iTemperature","valueAddress":"%IW0"}

Address syntax (CODESYS-style) + which FC to use:
  %IW*  → Holding-side words → use FC3 HoldingRegister (this demo)
  %QW*  → Input-register side → use FC4 InputRegister
  %IX*.* / %QX*.* → bits (coils / discrete)

After editing the file: Deploy the flow (IO-Config reloads on deploy).
Optional: export from PLC/CODESYS CSV and convert — see IO-Config node help.
Full demo dump: extras/ioFileData/learning-device.json

Seed vs names in this flow:
  HR[0]=42 → iTemperature, HR[1]=7 → iSetpoint, HR[2]=3 → iCounter, …
""",
    )
    names_howto = """HOW TO ADD YOUR OWN NAME (quick)

1) Open extras/ioFileData/names-starter.json in an editor
2) Add a line — name MUST start with type letter:
   {"name":"iLineSpeed","valueAddress":"%IW2"}
   (i=Integer, w=Word, u=Unsigned, b=Boolean, …)
3) In Modbus-IO-Config set Path to that file (relative extras/… is OK)
4) On Modbus-Read: enable "Use IO File" + "IO's As Payload"
5) On Response-Filter: Filter = iLineSpeed, Registers = 0
6) Deploy → Debug shows only that named object

Do NOT set Registers to the Modbus quantity when filtering named lists.
Do NOT use names without a type prefix (payload will be empty []).
"""
    read_howto = """Modbus-Read flags used here

• Use IO File = on → attach IO-Config mapping
• IO's As Payload = on → payload is named objects (not [42,7,3,…])
• log IO Activities = on → mapping traces in the log
• dataType HoldingRegister, adr 0, quantity 12 → FC3 range that covers %IW0..%IW11
• FC3 reads %I* names; FC4 would read %Q* names
"""
    filter_howto = """Modbus-Response-Filter flags used here

• filter = iTemperature → keep items where item.name === 'iTemperature'
• registers = 0 → skip raw-length check (named list length ≠ Modbus quantity)
• filter Response Buffer / Values / Input = on → smaller msg after filter
• Lookup button (after Deploy) lists names from the linked IO-Config
"""
    flows["11-Node-IO-Config-And-Response-Filter.json"] = [
        tab(z, "11 IO-Config / Filter", text),
        comment(z, text, 160, 40),
        comment(z, names_howto, 160, 110, name="HOW TO: add / edit names"),
        comment(z, read_howto, 160, 180, name="CONFIG: Modbus-Read IO flags"),
        comment(z, filter_howto, 160, 250, name="CONFIG: Response-Filter"),
        server(sid, z, 10513, "IO Demo Server", 160, 340),
        client(cid, z, "IO Client", 10513),
        {
            "id": io,
            "type": "modbus-io-config",
            "z": z,
            "name": "Names starter (edit me)",
            "path": "extras/ioFileData/names-starter.json",
            "format": "utf8",
            "addressOffset": "",
        },
        {
            "id": inj,
            "type": "inject",
            "z": z,
            "name": "Seed HR [42,7,3,…]",
            "props": [{"p": "payload"}],
            "repeat": "",
            "crontab": "",
            "once": True,
            "onceDelay": 0.5,
            "topic": "",
            "payload": "",
            "payloadType": "date",
            "x": 160,
            "y": 440,
            "wires": [[fn]],
        },
        {
            "id": fn,
            "type": "function",
            "z": z,
            "name": "holding seed → named HR",
            "func": (
                "const registers = [42, 7, 3, 9, 0, 11, 0, 13, 0, 0, 0, 15]\n"
                "// The server buffer takes UInt8 bytes: two big-endian bytes per 16-bit register\n"
                "// HR0..11 → iTemperature, iSetpoint, iCounter, … (name prefix = type!)\n"
                "msg.payload = {\n"
                "  value: registers.flatMap((v) => [(v >> 8) & 0xff, v & 0xff]),\n"
                "  register: 'holding',\n"
                "  address: 0,\n"
                "  disableMsgOutput: 1\n"
                "};\n"
                "return msg;"
            ),
            "outputs": 1,
            "noerr": 0,
            "x": 400,
            "y": 440,
            "wires": [[sid]],
        },
        {
            "id": rd,
            "type": "modbus-read",
            "z": z,
            "name": "Read HR + IO names",
            "topic": "",
            "showStatusActivities": True,
            "logIOActivities": True,
            "showErrors": True,
            "showWarnings": True,
            "unitid": "1",
            "dataType": "HoldingRegister",
            "adr": "0",
            "quantity": "12",
            "rate": "2",
            "rateUnit": "s",
            "delayOnStart": True,
            "startDelayTime": "2",
            "server": cid,
            "useIOFile": True,
            "ioFile": io,
            "useIOForPayload": True,
            "emptyMsgOnFail": False,
            "keepMsgProperties": False,
            "x": 400,
            "y": 560,
            "wires": [[dbg_all, filt], [resp_id]],
        },
        response(resp_id, z, 900, 640, "Read response"),
        {
            "id": dbg_all,
            "type": "debug",
            "z": z,
            "name": "IO names (all)",
            "active": True,
            "tosidebar": True,
            "console": False,
            "tostatus": False,
            "complete": "payload",
            "x": 680,
            "y": 500,
            "wires": [],
        },
        {
            "id": filt,
            "type": "modbus-response-filter",
            "z": z,
            "name": "filter: iTemperature",
            "filter": "iTemperature",
            "registers": "0",
            "ioFile": io,
            "filterResponseBuffer": True,
            "filterValues": True,
            "filterInput": True,
            "showStatusActivities": False,
            "showErrors": True,
            "showWarnings": True,
            "x": 680,
            "y": 580,
            "wires": [[dbg_f]],
        },
        {
            "id": dbg_f,
            "type": "debug",
            "z": z,
            "name": "filtered: iTemperature",
            "active": True,
            "tosidebar": True,
            "console": False,
            "tostatus": False,
            "complete": "payload",
            "x": 960,
            "y": 580,
            "wires": [],
        },
    ]

    # 12
    z, sid = nid(), nid()
    inj, fn, dbg = nid(), nid(), nid()
    text = guide(
        "NODE: Modbus-Server (buffer slave)",
        features=[
            "In-package TCP Modbus slave backed by register buffers",
            "Inject writes into holding / coils / input / discrete buffers",
            "Five outputs mirror activity (not a per-request flow gateway)",
        ],
        config=[
            "serverPort / hostname → TCP listen endpoint",
            "coilsBufferSize / holdingBufferSize / … → buffer lengths",
            "Inject payload: { value, register, address, disableMsgOutput }",
            "register: 'holding' | 'coils' | 'input' | 'discrete'",
        ],
        howto=[
            "Deploy",
            "Click Fill holding → writes [11,22,33,44] into holding from address 0",
            "Attach a Modbus-Client (other examples) to read the buffer back",
        ],
        port=10514,
        extra="NOT a flow-based request/response gateway — see example 15 and GitHub #567.",
    )
    flows["12-Node-Server-Buffer-Slave.json"] = [
        tab(z, "12 Server Buffer", text),
        comment(z, text),
        {
            "id": inj,
            "type": "inject",
            "z": z,
            "name": "Fill holding",
            "props": [{"p": "payload"}],
            "repeat": "",
            "crontab": "",
            "once": False,
            "topic": "",
            "payload": "",
            "payloadType": "date",
            "x": 160,
            "y": 280,
            "wires": [[fn]],
        },
        {
            "id": fn,
            "type": "function",
            "z": z,
            "name": "holding buf",
            "func": "const registers = [11, 22, 33, 44]\n// The server buffer takes UInt8 bytes: two big-endian bytes per 16-bit register\nmsg.payload = { value: registers.flatMap((v) => [(v >> 8) & 0xff, v & 0xff]), register: 'holding', address: 0, disableMsgOutput: 0 };\nreturn msg;",
            "outputs": 1,
            "noerr": 0,
            "x": 360,
            "y": 280,
            "wires": [[sid]],
        },
        {
            "id": sid,
            "type": "modbus-server",
            "z": z,
            "name": "Buffer Slave",
            "logEnabled": False,
            "hostname": "127.0.0.1",
            "serverPort": "10514",
            "responseDelay": 100,
            "delayUnit": "ms",
            "coilsBufferSize": 10000,
            "holdingBufferSize": 10000,
            "inputBufferSize": 10000,
            "discreteBufferSize": 10000,
            "showErrors": True,
            "showStatusActivities": True,
            "x": 580,
            "y": 280,
            "wires": [[dbg], [dbg], [dbg], [dbg], [dbg]],
        },
        {
            "id": dbg,
            "type": "debug",
            "z": z,
            "name": "server outs",
            "active": True,
            "tosidebar": True,
            "console": False,
            "tostatus": False,
            "complete": "true",
            "x": 800,
            "y": 280,
            "wires": [],
        },
    ]

    # 13
    z, cid, sid = nid(), nid(), nid()
    http_in, http_out, fn, getter, resp_id = nid(), nid(), nid(), nid(), nid()
    text = guide(
        "PATTERN: HTTP → Modbus",
        features=[
            "HTTP GET endpoint triggers a Modbus-Getter",
            "JSON body returned via http response",
            "Pattern for dashboards / external systems without Modbus stack",
        ],
        config=[
            "http in url /modbus/learn/hr → path clients call",
            "Getter dataType/adr/quantity → which registers to read",
            "keepMsgProperties=true → HTTP request context can survive if needed",
            "Function builds { data, topic } JSON body + statusCode 200",
        ],
        howto=[
            "Deploy",
            "GET http://<node-red-host>:1880/modbus/learn/hr",
            "Expect JSON with Holding Register data",
        ],
        port=10515,
    )
    flows["13-Pattern-HTTP-To-Modbus.json"] = [
        tab(z, "13 HTTP → Modbus", text),
        comment(z, text),
        server(sid, z, 10515, "", 140, 180),
        client(cid, z, "HTTP Client", 10515),
        {
            "id": http_in,
            "type": "http in",
            "z": z,
            "name": "GET /modbus/learn/hr",
            "url": "/modbus/learn/hr",
            "method": "get",
            "upload": False,
            "swaggerDoc": "",
            "x": 180,
            "y": 320,
            "wires": [[getter]],
        },
        {
            "id": getter,
            "type": "modbus-getter",
            "z": z,
            "name": "HR via HTTP",
            "showStatusActivities": True,
            "showErrors": True,
            "showWarnings": True,
            "logIOActivities": False,
            "unitid": "1",
            "dataType": "HoldingRegister",
            "adr": "0",
            "quantity": "4",
            "server": cid,
            "useIOFile": False,
            "ioFile": "",
            "useIOForPayload": False,
            "emptyMsgOnFail": False,
            "keepMsgProperties": True,
            "x": 420,
            "y": 320,
            "wires": [[fn], [resp_id]],
        },
        {
            "id": fn,
            "type": "function",
            "z": z,
            "name": "HTTP body",
            "func": "msg.payload = { data: msg.payload, topic: msg.topic };\nmsg.statusCode = 200;\nreturn msg;",
            "outputs": 1,
            "noerr": 0,
            "x": 680,
            "y": 280,
            "wires": [[http_out]],
        },
        {
            "id": http_out,
            "type": "http response",
            "z": z,
            "name": "HTTP 200 JSON",
            "statusCode": "",
            "headers": {},
            "x": 920,
            "y": 280,
            "wires": [],
        },
        response(resp_id, z, 680, 420, "Getter response"),
    ]

    # 14
    z, cid = nid(), nid()
    fg, inj, fn, resp_id = nid(), nid(), nid(), nid()
    text = guide(
        "PATTERN: Serial RTU client (educational)",
        features=[
            "Modbus-Client type = serial (RTU-BUFFERD)",
            "Flex-Getter payload same shape as TCP demos",
            "Shows required serial settings without needing CI hardware",
        ],
        config=[
            "serialPort → /dev/ttyUSB0, COMx, … (must exist on your host)",
            "serialBaudrate / databits / stopbits / parity → match the device",
            "serialType RTU-BUFFERD → usual choice for RTU",
            "unit_id on client → default slave; override per Flex-Getter payload",
        ],
        howto=[
            "Set serialPort to your adapter",
            "Deploy (client stays inactive without a real port — expected)",
            "When the port is up, click Read HR to issue FC3",
        ],
        extra="Not for CI without hardware. TCP learning: examples 02–13.",
    )
    flows["14-Pattern-Serial-RTU-Client.json"] = [
        tab(z, "14 Serial RTU", text),
        comment(z, text),
        client(cid, z, "Serial Client", 0, serial=True),
        {
            "id": inj,
            "type": "inject",
            "z": z,
            "name": "Read HR (when port up)",
            "props": [{"p": "payload"}],
            "repeat": "",
            "crontab": "",
            "once": False,
            "topic": "",
            "payload": "",
            "payloadType": "date",
            "x": 200,
            "y": 280,
            "wires": [[fn]],
        },
        {
            "id": fn,
            "type": "function",
            "z": z,
            "name": "FC3 payload",
            "func": "msg.payload = { fc: 3, unitid: 1, address: 0, quantity: 2 };\nreturn msg;",
            "outputs": 1,
            "noerr": 0,
            "x": 420,
            "y": 280,
            "wires": [[fg]],
        },
        {
            "id": fg,
            "type": "modbus-flex-getter",
            "z": z,
            "name": "",
            "showStatusActivities": True,
            "showErrors": True,
            "showWarnings": True,
            "logIOActivities": False,
            "server": cid,
            "useIOFile": False,
            "ioFile": "",
            "useIOForPayload": False,
            "emptyMsgOnFail": False,
            "keepMsgProperties": True,
            "delayOnStart": False,
            "startDelayTime": "",
            "x": 640,
            "y": 280,
            "wires": [[], [resp_id]],
        },
        response(resp_id, z, 860, 280),
    ]

    # 15
    z, cid, sid = nid(), nid(), nid()
    inj, fn, dbg, rd, resp_id = nid(), nid(), nid(), nid(), nid()
    text = guide(
        "PATTERN: Gateway with buffer server (what works TODAY)",
        features=[
            "Modbus-Server as a buffer-backed 'cache' slave",
            "Flow inject fills holding buffers; external or local clients read them",
            "Shows the boundary of the in-package server (no per-request flow replies)",
        ],
        config=[
            "Server buffers hold the last written values (FC3/FC6 style access from clients)",
            "Inject payload register/address/value → writes into the buffer",
            "Local Modbus-Read demonstrates reading the cache back",
        ],
        howto=[
            "Deploy",
            "Click Cache HR values",
            "Watch Read / Debug for buffered values",
            "Point an external Modbus master at 127.0.0.1:10516 to read the same buffers",
        ],
        port=10516,
        extra="""You CANNOT craft protocol responses per inbound request in the flow.
Dynamic Server / Gateway = GitHub #567 → planned SEPARATE package.
See docs/p4nr/capabilities/modbus-dynamic-server-gateway.md""",
    )
    flows["15-Pattern-Gateway-With-Buffer-Server.json"] = [
        tab(z, "15 Gateway (buffer)", text),
        comment(z, text),
        {
            "id": inj,
            "type": "inject",
            "z": z,
            "name": "Cache HR values",
            "props": [{"p": "payload"}],
            "repeat": "10",
            "crontab": "",
            "once": True,
            "onceDelay": 0.5,
            "topic": "",
            "payload": "",
            "payloadType": "date",
            "x": 180,
            "y": 280,
            "wires": [[fn]],
        },
        {
            "id": fn,
            "type": "function",
            "z": z,
            "name": "simulate cache",
            "func": (
                "const registers = [100, 200, 300]\n"
                "// The server buffer takes UInt8 bytes: two big-endian bytes per 16-bit register\n"
                "msg.payload = {\n"
                "  value: registers.flatMap((v) => [(v >> 8) & 0xff, v & 0xff]),\n"
                "  register: 'holding',\n"
                "  address: 0,\n"
                "  disableMsgOutput: 0\n"
                "};\n"
                "return msg;"
            ),
            "outputs": 1,
            "noerr": 0,
            "x": 400,
            "y": 280,
            "wires": [[sid]],
        },
        {
            "id": sid,
            "type": "modbus-server",
            "z": z,
            "name": "Edge cache slave",
            "logEnabled": False,
            "hostname": "127.0.0.1",
            "serverPort": "10516",
            "responseDelay": 100,
            "delayUnit": "ms",
            "coilsBufferSize": 10000,
            "holdingBufferSize": 10000,
            "inputBufferSize": 10000,
            "discreteBufferSize": 10000,
            "showErrors": True,
            "showStatusActivities": True,
            "x": 640,
            "y": 280,
            "wires": [[dbg], [dbg], [dbg], [dbg], [dbg]],
        },
        {
            "id": dbg,
            "type": "debug",
            "z": z,
            "name": "server activity",
            "active": True,
            "tosidebar": True,
            "console": False,
            "tostatus": False,
            "complete": "true",
            "x": 880,
            "y": 240,
            "wires": [],
        },
        client(cid, z, "Local verify client", 10516),
        {
            "id": rd,
            "type": "modbus-read",
            "z": z,
            "name": "Verify cache FC3",
            "topic": "",
            "showStatusActivities": True,
            "logIOActivities": False,
            "showErrors": True,
            "showWarnings": True,
            "unitid": "1",
            "dataType": "HoldingRegister",
            "adr": "0",
            "quantity": "3",
            "rate": "5",
            "rateUnit": "s",
            "delayOnStart": True,
            "startDelayTime": "2",
            "server": cid,
            "useIOFile": False,
            "ioFile": "",
            "useIOForPayload": False,
            "emptyMsgOnFail": False,
            "keepMsgProperties": False,
            "x": 640,
            "y": 420,
            "wires": [[], [resp_id]],
        },
        response(resp_id, z, 880, 420),
    ]

    # 16 — #423 shared-client disable isolation
    z, cid, sid = nid(), nid(), nid()
    fg_keep, fg_drop = nid(), nid()
    resp_k, resp_d = nid(), nid()
    inj_k, inj_d, fn_k, fn_d = nid(), nid(), nid(), nid()
    text = guide(
        "BUGFIX DEMO: shared Modbus-Client — disable one Flex-Getter (#423)",
        features=[
            "Two Modbus-Flex-Getter nodes share ONE Modbus-Client",
            "Keeper Flex-Getter keeps polling while you disable the other",
            "Shows fix for GitHub #423 / #487 (disable one must not STOP siblings)",
        ],
        config=[
            "Both Flex-Getters → same Client (tcpPort 10517)",
            "showStatusActivities=true → you see connected / closed on the node",
            "Keeper inject repeats every 2 s → continuous SEE: debug traffic",
            "DISABLE ME inject is manual only (for optional compare)",
        ],
        howto=[
            "Deploy — wait until both Flex-Getters look active/connected",
            "Watch Debug SEE: KEEP — payload arrays every ~2 s",
            "Select node «DISABLE ME (#423)» → Disable → Deploy (should finish quickly, not ~15 s)",
            "PASS: SEE: KEEP still receives data; KEEP node stays active (not closed)",
            "FAIL (old bug): KEEP goes closed / Debug stops when DISABLE ME is disabled",
            "Optional: re-enable DISABLE ME, or delete it — KEEP must still run",
        ],
        port=10517,
        extra="""Related: docs/p4nr/capabilities/shared-client-deregister-isolation.md
Consumers on a *different* Client are unrelated — this tab uses one shared client on purpose.""",
    )
    flows["16-Bugfix-Shared-Client-Disable-Isolation.json"] = [
        tab(z, "16 Shared-Client #423", text),
        comment(z, text, 200, 40),
        server(sid, z, 10517, "Shared-Client Demo Server", 140, 200),
        client(cid, z, "SHARED Client (both getters)", 10517),
        {
            "id": inj_k,
            "type": "inject",
            "z": z,
            "name": "KEEP poll every 2s",
            "props": [{"p": "payload"}],
            "repeat": "2",
            "crontab": "",
            "once": True,
            "onceDelay": 1.5,
            "topic": "",
            "payload": "",
            "payloadType": "date",
            "x": 180,
            "y": 320,
            "wires": [[fn_k]],
        },
        {
            "id": fn_k,
            "type": "function",
            "z": z,
            "name": "FC3 qty 2",
            "func": "msg.payload = { fc: 3, unitid: 1, address: 0, quantity: 2 };\nreturn msg;",
            "outputs": 1,
            "noerr": 0,
            "x": 400,
            "y": 320,
            "wires": [[fg_keep]],
        },
        {
            "id": fg_keep,
            "type": "modbus-flex-getter",
            "z": z,
            "name": "KEEP — leave enabled",
            "showStatusActivities": True,
            "showErrors": True,
            "showWarnings": True,
            "logIOActivities": False,
            "server": cid,
            "useIOFile": False,
            "ioFile": "",
            "useIOForPayload": False,
            "emptyMsgOnFail": False,
            "keepMsgProperties": True,
            "delayOnStart": True,
            "startDelayTime": "1",
            "x": 640,
            "y": 320,
            "wires": [[], [resp_k]],
        },
        response(resp_k, z, 920, 400, "KEEP response"),
        {
            "id": inj_d,
            "type": "inject",
            "z": z,
            "name": "Optional read (DISABLE ME path)",
            "props": [{"p": "payload"}],
            "repeat": "",
            "crontab": "",
            "once": False,
            "topic": "",
            "payload": "",
            "payloadType": "date",
            "x": 220,
            "y": 500,
            "wires": [[fn_d]],
        },
        {
            "id": fn_d,
            "type": "function",
            "z": z,
            "name": "FC3 qty 4",
            "func": "msg.payload = { fc: 3, unitid: 1, address: 0, quantity: 4 };\nreturn msg;",
            "outputs": 1,
            "noerr": 0,
            "x": 440,
            "y": 500,
            "wires": [[fg_drop]],
        },
        {
            "id": fg_drop,
            "type": "modbus-flex-getter",
            "z": z,
            "name": "DISABLE ME (#423)",
            "showStatusActivities": True,
            "showErrors": True,
            "showWarnings": True,
            "logIOActivities": False,
            "server": cid,
            "useIOFile": False,
            "ioFile": "",
            "useIOForPayload": False,
            "emptyMsgOnFail": False,
            "keepMsgProperties": True,
            "delayOnStart": True,
            "startDelayTime": "1",
            "x": 680,
            "y": 500,
            "wires": [[], [resp_d]],
        },
        response(resp_d, z, 960, 580, "DISABLE ME response"),
    ]

    return flows


def main():
    # remove legacy json
    for p in OUT.glob("*.json"):
        p.unlink()
        print("removed", p.name)

    flows = build()
    for name, nodes in flows.items():
        nodes = ensure_see_debug(nodes)
        nodes = declutter(nodes)
        path = OUT / name
        path.write_text(json.dumps(nodes, indent=2) + "\n")
        print("wrote", name, "nodes=", len(nodes))

    assert len(list(OUT.glob("*.json"))) == 16
    # sanity: no flex-server, no /Users/Shared
    for p in OUT.glob("*.json"):
        text = p.read_text()
        assert "modbus-flex-server" not in text, p
        assert "/Users/Shared" not in text, p
    print("OK: 16 examples")


if __name__ == "__main__":
    main()
