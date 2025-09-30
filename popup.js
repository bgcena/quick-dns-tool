document.getElementById("resolveBtn").addEventListener("click", resolveDNS);
document.getElementById("clearBtn").addEventListener("click", () => {
  document.getElementById("hostname").value = "";
  document.getElementById("result").innerHTML = "";
  document.getElementById("status").textContent = "";
});
document.getElementById("toggleAdvanced").addEventListener("click", () => {
  const adv = document.getElementById("advancedOptions");
  if (adv.style.display === "none") {
    adv.style.display = "flex";
    document.getElementById("toggleAdvanced").textContent = "Advanced ▲";
  } else {
    adv.style.display = "none";
    document.getElementById("toggleAdvanced").textContent = "Advanced ▼";
  }
});

async function resolveDNS() {
  const hostnames = document.getElementById("hostname").value
    .split("\n")
    .map(h => h.trim())
    .filter(h => h.length > 0);

  if (hostnames.length === 0) {
    document.getElementById("status").textContent = "Please enter at least one hostname.";
    return;
  }

  const provider = document.getElementById("provider").value;
  const type = document.getElementById("rtype").value;

  const baseUrl =
    provider === "cloudflare"
      ? "https://cloudflare-dns.com/dns-query"
      : "https://dns.google/resolve";

  document.getElementById("status").textContent = "Resolving...";
  const resultsDiv = document.getElementById("result");
  resultsDiv.innerHTML = "";

  for (const hostname of hostnames) {
    try {
      const response = await fetch(`${baseUrl}?name=${hostname}&type=${type}`, {
        headers: { accept: "application/dns-json" },
      });
      const data = await response.json();
      const block = document.createElement("div");
      block.className = "result-block";

      if (data.Answer) {
        let output = "";
        for (const ans of data.Answer) {
          output += `${ans.name}\t${ans.TTL}\tIN\t${ans.type === 1 ? "A" :
                     ans.type === 28 ? "AAAA" :
                     ans.type === 5 ? "CNAME" :
                     ans.type === 15 ? "MX" :
                     ans.type === 2 ? "NS" :
                     ans.type === 16 ? "TXT" : ans.type}\t${ans.data}\n`;
        }
        block.textContent = output.trim();
      } else {
        block.textContent = `${hostname}: No records found.`;
      }

      resultsDiv.appendChild(block);
    } catch (e) {
      const block = document.createElement("div");
      block.className = "result-block";
      block.textContent = `${hostname}: Error fetching DNS (${e.message})`;
      resultsDiv.appendChild(block);
    }
  }

  document.getElementById("status").textContent = "Done.";
}
