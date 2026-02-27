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

function getMonthYear(date = new Date()) {
	return date.toLocaleString("en-US", {
		month: "long",
		year: "numeric",
	});
}

const generateReadme = (jobs) => {
	try {
		console.log("🔄 Generating README.md...");

		const totalJobs = jobs.length;
		const remoteJobs = jobs.reduce((count, job) => {
			return (job.locationNew || job.location || "").toLowerCase().includes("remote")
				? count + 1
				: count;
		}, 0);

		// README Header - Premium Style
		let content = `
<h1>2026 New Grad Jobs | Daily Job Updates</h1>

![Updated Daily](https://img.shields.io/badge/Updated_Daily-green?style=for-the-badge&logo=clock)
![Location: USA](https://img.shields.io/badge/Location:_USA-blue?style=for-the-badge&logo=googlemaps)
![Level: New Graduate](https://img.shields.io/badge/Level:_New_Graduate-orange?style=for-the-badge&logo=education)

### 📅 Last Updated
**${new Date().toLocaleString("en-US", {
			timeZone: "America/New_York",
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
			timeZoneName: "short",
		})}**

If you're graduating in 2025 or 2026, this repository is built for you.

You will find the latest new grad jobs across:
- Fortune 500 companies
- High-growth startups
- Remote opportunities
- On-site roles across major US cities

Major profiles include:

\`Data Engineer\` • \`Project Engineer\` • \`Software Engineer\` • \`Clinical Nurse\` • \`Product Manager\` • \`Full Stack Developer\` • \`Business Analyst\` • \`Finance\` • \`Marketing\`

All roles are refreshed every **24 hours**.

---

### <h2>🎓 Who is this repository for ? </h2>

College seniors • Recent graduates • Campus hiring roles • Class of 2025 & 2026

### <h2>🎓 New Grad Tip</h2>

<div align="center">
<div style="
background-color:#0d1117;
border:1px solid #30363d;
border-radius:12px;
padding:20px;
width:100%;
max-width:800px;
color : white;
">

<p>
	<b>Always apply with a resume whose ATS score is above 80%.</b>
</p>

<hr style="height:1px;border:none;background-color:#30363d;">

<p>
	<i>More than 75% of resumes are filtered out before a human sees them. Make sure yours isn't one of them.</i>
</p>

<a href="https://www.mployee.me/resumescan?utm_source=new_grad_jobs&utm_medium=github&utm_campaign=seo_mkt" target="_blank">
	<img 
	src="https://img.shields.io/badge/-🚀%20Score%20My%20Resume-243c7c?style=for-the-badge" 
	alt="Score My Resume"
	width="300"
	/>
</a>

</div>
</div>

---

### <h2><img src="https://img.icons8.com/clouds/100/000000/resume.png" width="30" height="30" align="center"> <font color="#58a6ff">What Makes</font> This New Grad Job List Different?</h2>

<div align="center" style="color : white">
<table width="100%">
  <tr>
    <td width="50%" style="vertical-align: top; padding-right: 20px;">
      <ul>
        <li>Jobs are refreshed every 24 hours</li>
        <li>Expired listings are removed</li>
        <li>Active US-based graduate roles</li>
      </ul>
    </td>
    <td width="50%" style="vertical-align: top; padding-left: 20px;">
      <ul>
        <li>Direct application links provided</li>
        <li>Focus strictly on 2025 & 2026 graduates</li>
        <li>Provides jobs from various industries</li>
      </ul>
    </td>
  </tr>
</table>
</div>

<div align="center">
<p>🔥 Start Applying to Latest New Grad Roles Below ↓</p>
</div>

---

## 🎓 New Grad Jobs (All Roles)

> 💼 **${totalJobs}** positions available

<table width="100%">
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
					? `<a target="_blank" rel="noopener noreferrer" href="${job.company_url}">${job.company || "-"}</a>`
					: job.company || "-";

				const role = job.title || "-";
				const location = getLocationBadge(job.locationNew || job.location);
				const posted = getTimeAgo(job.posted_date || job.postedDateTime);

				// Generate dynamic URL for your website (no profile sections now)
				const jobUrl = `${baseUrl}/us${job?.url}?utm_source=us_job_pages&utm_medium=github&utm_campaign=seo_mkt`
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

### <h2>🇺🇸 <font color="#58a6ff">Where Are These New Grad Jobs</font> Located?</h2>

<p align="center">
<a href="https://www.mployee.me/us/jobs/software-developer-jobs/atlanta_ga"><img src="https://img.shields.io/badge/Atlanta-1f425f?style=for-the-badge&logoColor=white" /></a>
<a href="https://www.mployee.me/us/jobs/software-developer-jobs/san-francisco_ca"><img src="https://img.shields.io/badge/San_Francisco-008080?style=for-the-badge&logoColor=white" /></a>
<a href="https://www.mployee.me/us/jobs/software-developer-jobs/austin_tx"><img src="https://img.shields.io/badge/Austin-4b0082?style=for-the-badge&logoColor=white" /></a>
<a href="https://www.mployee.me/us/jobs/software-developer-jobs/boston_ma"><img src="https://img.shields.io/badge/Boston-8b4513?style=for-the-badge&logoColor=white" /></a>
<a href="https://www.mployee.me/us/jobs/software-developer-jobs/chicago_il"><img src="https://img.shields.io/badge/Chicago-000080?style=for-the-badge&logoColor=white" /></a>
<a href="https://www.mployee.me/us/jobs/software-developer-jobs/washington_dc"><img src="https://img.shields.io/badge/Washington_DC-778899?style=for-the-badge&logoColor=white" /></a>
<a href="https://www.mployee.me/us/jobs/software-developer-jobs/phoenix_az"><img src="https://img.shields.io/badge/Phoenix-2f4f4f?style=for-the-badge&logoColor=white" /></a>
</p>

<p>This repository includes new grad jobs in software engineering, data engineering, finance, healthcare, and operations across top hiring cities in the United States.</p>

---

### <h2>🔍 <font color="#58a6ff">Find Your Right Fit By Profile</font></h2>

<p align="center">
If these were not the jobs you were looking for, try searching based on the profile:
</p>

<p align="center">
<a href="https://www.mployee.me/us/jobs/software-developer-jobs"><img src="https://img.shields.io/badge/Software_Developer-0078D4?style=for-the-badge&logoColor=white" /></a>
<a href="https://www.mployee.me/us/jobs/data-engineer-jobs"><img src="https://img.shields.io/badge/Data_Engineer-28A745?style=for-the-badge&logoColor=white" /></a>
<a href="https://www.mployee.me/us/jobs/business-analyst-jobs"><img src="https://img.shields.io/badge/Business_Analyst-FFC107?style=for-the-badge&logoColor=white" /></a>
<a href="https://www.mployee.me/us/jobs/data-scientist-jobs"><img src="https://img.shields.io/badge/Data_Scientist-6F42C1?style=for-the-badge&logoColor=white" /></a>
<a href="https://www.mployee.me/us/jobs/python-developer-jobs"><img src="https://img.shields.io/badge/Python_Developer-3776AB?style=for-the-badge&logoColor=white" /></a>
<a href="https://www.mployee.me/us/jobs/ai-solution-specialist-jobs"><img src="https://img.shields.io/badge/AI--Solution_Specialist-00A4EF?style=for-the-badge&logoColor=white" /></a>
<a href="https://www.mployee.me/us/jobs/accountant-jobs"><img src="https://img.shields.io/badge/Accountant-D22128?style=for-the-badge&logoColor=white" /></a>
<a href="https://www.mployee.me/us/jobs/sales-manager-jobs"><img src="https://img.shields.io/badge/Sales-00A3A0?style=for-the-badge&logoColor=white" /></a>
<a href="https://www.mployee.me/us/jobs/finance-executive-jobs"><img src="https://img.shields.io/badge/Finance_Executive-E91E63?style=for-the-badge&logoColor=white" /></a>
</p>

---


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

		// Sort by time descending (newest first)
		jobs.sort((a, b) => new Date(b.postedDateTime) - new Date(a.postedDateTime));

		console.log("total jobs : ", jobs.length);
		generateReadme(jobs);

	} catch (err) {
		console.log("[ERROR] in main driver function ", err)
	} finally {
		await db.close()
	}
}

main()