import fs from "fs";
import { Mongo } from "./dbConfig.js";

const db = new Mongo(process.env.MONGODB_URI, process.env.DB_NAME || "test");

const collections = ["jobs_it_mgmts_usa", "jobs_fin_legal_hrs_usa", "jobs_sales_mkt_ops_usa"]
const baseUrl = process.env.WEBSITE_URL || 'https://yourwebsite.com';

const TO_INCLUDE = {
	company: 1,
	company_url: 1,
	locationNew: 1,
	location: 1,
	title: 1,
	country: 1,
	postedDateTime: 1,
	posted_date: 1,
	_id: 1,
	url: 1,
	"Job ID (Numeric)": 1
};


const getTimeAgo = (dateString) => {
	if (!dateString || dateString === "-") return "-";

	try {
		const date = new Date(dateString);
		const now = new Date();
		const seconds = Math.floor((now - date) / 1000);
		const days = Math.floor(seconds / 86400);

		if (days === 0) return "Today";
		if (days === 1) return "1d ago";
		if (days < 7) return `${days}d ago`;
		if (days < 30) return `${Math.floor(days / 7)}w ago`;
		if (days < 365) return `${Math.floor(days / 30)}mo ago`;
		return `${Math.floor(days / 365)}y ago`;
	} catch {
		return dateString;
	}
};

// Get location badge with color
const getLocationBadge = (location) => {
	if (!location || location === "-") return "-";

	if (location.toLowerCase().includes("remote")) {
		return `![Remote](https://img.shields.io/badge/🌍_Remote-green)`;
	} else if (location.toLowerCase().includes("hybrid")) {
		return `![Hybrid](https://img.shields.io/badge/🏢_Hybrid-orange) ${location}`;
	} else {
		return `📍 ${location}`;
	}
};

// Get profile emoji
const getProfileEmoji = (profile) => {
	const emojiMap = {
		"Data Scientist": "📊",
		"Business Analyst": "💼",
		"Product Manager": "🚀",
		"Full Stack Developer": "💻",
	};
	return emojiMap[profile] || "📋";
};

const generateReadme = (jobs) => {
	try {
		console.log("🔄 Generating README.md...");

		const totalJobs = jobs.length;
		const remoteJobs = jobs.reduce((count, job) => {
			return (job.locationNew || job.location || "").toLowerCase().includes("remote")
				? count + 1
				: count;
		}, 0);

		// README Header - New Style
		let content = `
<div align="center">

<h1>New Grad Jobs USA 2026 🇺🇸 | Tech, IT & Entry Level Roles</h1>

If you're graduating in 2025 or 2026, this repo is for you. You will find latest jobs from fortune 500 companies, startups, remote opportunities and on-site roles across major US cities. Major profiles like Software engineering, data, IT, and entry level tech roles updated every 24 hours.

<br />

![Total Listings](https://img.shields.io/badge/Total_Listings-${totalJobs}-blue?style=for-the-badge&logo=database)
![Remote Jobs](https://img.shields.io/badge/Remote_Jobs-${remoteJobs}-green?style=for-the-badge&logo=home-assistant)
![Last Updated](https://img.shields.io/badge/Updated-${new Date().toLocaleDateString()}-orange?style=for-the-badge&logo=clock)

</div>

---

## ⚡ Quick Actions

- ⭐ **Star this repository** to stay updated
- 👀 **Edit resume** before applying
- 🔁 **Updated** every 24 hours

---

<div align="center">
<table width="100%">
  <tr>
    <td bgcolor="#0d1117" align="center">
      <br />
      <p align="center">
        <b>🎓 New Grad Tip</b>
      </p>
      <p align="center">
        If you apply to 100 jobs, you should edit your resume 100 times.
      </p>
      <br />
      <a href="#" target="_blank">
        <img src="https://img.shields.io/badge/%20-Resume_Keywords_Finder-28a745?style=for-the-badge&logoColor=white" alt="Resume Keywords Finder" />
      </a>
      <br />
      <br />
      <p align="center">
        <i><font size="2" color="#8b949e">Share any other cool projects you make using the repo, and we might give you a shoutout!</font></i>
        <br />
        <sub><font size="1">(Always add keywords from JD before applying)</font></sub>
      </p>
    </td>
  </tr>
</table>
</div>

---

## 💼 Job Roles Covered

- 📊 Data scientist
- 💼 Business Analyst
- 🚀 Product Manager
- 💻 Full Stack Developer

---

## 🎓 New Grad Jobs (All Roles)

> 💼 **${totalJobs}** positions available

<table>
<thead>
<tr>
<th width="20%">🏢 Company</th>
<th width="35%">💼 Role</th>
<th width="20%">📍 Location</th>
<th width="10%">⏰ Posted</th>
<th width="15%">🔗 Action</th>
</tr>
</thead>
<tbody>
`;

		if (jobs.length === 0) {
			content += `<tr><td colspan="5" align="center"><i>No positions available at the moment. Check back soon! 🔄</i></td></tr>\n`;
		} else {
			jobs.forEach((job) => {
				const company = job.company_url
					? `<a href="${job.company_url}">${job.company || "-"}</a>`
					: job.company || "-";

				const role = job.title || "-";
				const location = getLocationBadge(job.locationNew || job.location);
				const posted = getTimeAgo(job.posted_date || job.postedDateTime);

				// Generate dynamic URL for your website (no profile sections now)
				const jobUrl = `${baseUrl}/us${job?.url}`
				const apply = `<a target="_blank" rel="noopener noreferrer" href="${jobUrl}"><img src="https://img.shields.io/badge/View-Job-blue?style=flat-square&logo=briefcase" alt="View Job"></a>`;

				content += `<tr>
<td>${company}</td>
<td>${role}</td>
<td>${location}</td>
<td>${posted}</td>
<td align="center">${apply}</td>
</tr>\n`;
			});
		}

		content += `</tbody>
</table>

---

### 📅 Last Updated

**${new Date().toLocaleString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			timeZoneName: "short",
		})}**
`;

		// Write to file
		fs.writeFileSync("README.md", content);
		console.log("✅ README.md generated successfully!");
		console.log(`📊 Statistics:`);
		console.log(`   - Total jobs: ${totalJobs}`);
		console.log(`   - Remote jobs: ${remoteJobs}`);
	} catch (err) {
		console.error("[ERROR] Generating README:", err);
		throw err;
	}
};

const findJobs = async (collection) => {
	try {
		const regex = /new grad(s|uation|uate)?/i;
		const query = {
			title: { $regex: regex }
		}

		const jobs = await collection.find(query, {
			projection: TO_INCLUDE
		}).toArray();
		return jobs

	} catch (err) {
		console.log("[ERROR] in findJobs function ", err)
	}
}

const main = async () => {
	try {

		const jobs = (await Promise.all(
			collections.map(async (name) => {
				const collection = await db.getCollection(name);
				return findJobs(collection);
			})
		)).flat();

		console.log("total jobs : ", jobs.length);
		generateReadme(jobs);

	} catch (err) {
		console.log("[ERROR] in main driver function ", err)
	} finally {
		await db.close()
	}
}

main()