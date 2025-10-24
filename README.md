# 2025W1-All-In-One

## Link to Deployed Application
All-In-One --> https://all-in-one.meteorapp.com/

## Members
Brandon Luu - bluu0013@student.monash.edu  
Naailah Taqui Hasan - nhas0021@student.monash.edu  
Aryan Chordia - acho0098@student.monash.edu  
Nicolas Winarto - nwin0008@student.monash.edu  
Kenuli Wijegunarathne - kwij0022@student.monash.edu  
Claire Zhang - czha0152@student.monash.edu  
Charlotte Evans - ceva0014@student.monash.edu  
Tarini Mehta - tmeh0003@student.monash.edu  
Vanshika Gupta - vgup0011@student.monash.edu  
Ryani Fernandopulle - rfer0035@student.monash.edu  
Stefani Rijab - srij0001@student.monash.edu  
Thytus Benjamin - tben0015@student.monash.edu

## Introduction

The All In One application is a property management platform designed to streamline interactions between landlords, tenants, and agents within a single integrated system. By consolidating application, communication, property listings, tenant requests, and administrative workflows into one application, the platform aims to reduce inefficiencies and improve the overall property management experience.
The primary purpose of this document is to support future developers by providing the technical and procedural knowledge necessary to understand, run, and extend the system. Unlike standard user documentation, this handover documentation is developer-focused. It outlines the required software and hardware environments, provides step-by-step setup and deployment instructions, identifies common pitfalls, and highlights ongoing development considerations. By following this document, future contributors should be able to quickly run the application, understand its high-level architecture, and start contributing effectively.


## Local Installation

### Installing Dependencies
The application uses the following dependencies, which can be installed by running `npm install` in the command prompt, followed by the name of the dependency:

 - @babel/runtime
 - @cloudinary/react
 - @cloudinary/url-gen
 - @emotion/react
 - @emotion/styled
 - @fullcalendar/interaction
 - @fullcalendar/react
 - @fullcalendar/timegrid
 - @google/generative-ai
 - @heroicons/react
 - @mui/icons-material
 - @mui/material
 - @opentelemetry/api
 - @react-google-maps/api
 - @tailwindcss/postcss
 - axios
 - cheerio
 - clone
 - cloudinary
 - dayjs
 - dotenv
 - lucide-react
 - meteor-node-stubs
 - mui
 - next
 - postcss-load-config
 - react
 - react-dom
 - react-icons
 - react-router
 - react-router-dom
 - react-slick
 - simpl-schema
 - slick-carousel
 - uuid
 - autoprefixer
 - postcss
 - tailwindcss
 
### Running the Application Locally
Type the following command into your terminal:

```bash
npm start
```

Visit http://localhost:3000 in your browser. Use the link generated in the terminal of your VS Code.

**Additional Notes:** A private key needs to be created locally in the main folder: `all-in-one-settings.json`. Add the API key to this file and add it to `.gitignore`. This ensures privacy of the API key.

### Deployment
Staging → https://all-in-one.meteorapp.com/  
Production → https://all-in-one.meteorapp.com/  
Deployment of Database → mongodb://ac03:RGbt5thNptxR5uAnn@galaxyadmin_galaxyfreedb-01.mongodb.galaxy-cloud.io:30025,galaxyadmin_galaxyfreedb-02.mongodb.galaxy-cloud.io:30025,galaxyadmin_galaxyfreedb-03.mongodb.galaxy-cloud.io:30025/all-in-one-meteorapp-com?replicaSet=galaxyadmin_galaxyfreedb&ssl=true  
Deployment → Galaxy Cloud 2.0 (through terminal)  


### Project Structure (High-Level)

```
/client          →  React UI components
/server          →  Meteor server methods
/imports/api     →  Database collections & methods
/imports/ui      →  React dialogs, forms, views
/config          →  Environment & app configuration
/tests           →  Unit and integration tests
```

### Hardware Requirements

- **CPU:** Dual-core processor (Intel i5 or AMD equivalent)
- **RAM:** 8GB (16GB recommended)
- **Disk:** ~20GB free space
- **OS:** Windows 10+, macOS 12+, or Ubuntu 20.04+

### Software Requirements

The following software is required to **develop, run, and maintain** the All-In-One Property Management System.

---

## Runtime / Frameworks
- **Meteor.js** (v3.1.2 or above) – Full-stack JavaScript framework  
- **React** (v18 or above) – Frontend UI library  
- **Node.js** (v14 LTS or above, bundled with Meteor) – Runtime environment required for Meteor to execute  
- **npm** (v10.8.2 or above, bundled with Node.js) – Package manager  

---

## Database
- **MongoDB** (local installation) – Document-based NoSQL database  

---

## Version Control
- **Git** (latest stable release) – Repository hosted on GitHub  

---

## UI Tools
- **Figma** – Web application for UI wireframing and prototyping  

---

## Development Tools
- **Visual Studio Code** (recommended IDE) – with Meteor and React extensions  
- **MongoDB Compass** (optional) – For database inspection  

---

## Collaboration Tools
- **ClickUp** – Project and backlog management  
- **Google Drive** – Documentation and file sharing  
- **Discord** – Internal team communication  

---

## API Key Setup
1. Visit [Google Maps Embed API](https://developers.google.com/maps/documentation/embed/get-api-key)  
2. Follow the steps to generate API keys  
3. **Generate two API keys:**
   - One for **Google Maps**  
   - One for **Google Gemini**

## Versioning Strategy

### Overview

For future development starting from the completion of Milestone 4, the project follows **Semantic Versioning 2.0.0**. Version numbers are structured as `MAJOR.MINOR.PATCH`, for example: `1.4.2`.

The initial version **v1.0.0** represents the Milestone 4 submission as the first production-ready release (baseline), consisting of all core features developed throughout the year in FIT3170.

### Version Number Structure

**Format:** `MAJOR.MINOR.PATCH`

**Starting Version:** `v1.0.0` (Milestone 4)

#### MAJOR Version
Incremented for major changes that break existing features (e.g., incompatible API changes or significant architectural changes).

- **Example:** `1.x.x` → `2.0.0`
- **Use Case:** Breaking changes to authentication system for login

#### MINOR Version
Incremented for new features that do not affect existing features (backward-compatible).

- **Example:** `1.3.x` → `1.4.0`
- **Use Case:** Added property search filters

#### PATCH Version
Incremented for small bug fixes (backward-compatible).

- **Example:** `1.4.2` → `1.4.3`
- **Use Case:** Fixed date picker validation

#### Pre-release Versions

For features under development or testing, include a hyphen and identifier:

- **Early testing phase:** `1.5.0-alpha.1`
- **Feature-complete, undergoing testing:** `1.5.0-beta.1`
- **Release candidate, final testing before production:** `1.5.0-rc.1`

### Version Increment Guidelines

#### MAJOR (Breaking Changes)

- Changes to API endpoints that break existing integrations
- Database schema changes requiring migration
- Removal of deprecated features
- Changes to authentication/authorization flow

#### MINOR (New Features)

- New API endpoints or features
- Enhanced functionality that doesn't break existing code
- New user interface components or pages
- Performance improvements

#### PATCH (Bug Fixes)

- Security patches
- Bug fixes
- Documentation updates
- UI tweaks and minor improvements

### Tagging & Releases

#### Git Tagging

All releases must be tagged in Git using the format `v{MAJOR}.{MINOR}.{PATCH}`:

```bash
git tag -a v1.4.2 -m "Release version 1.4.2: Fixed date validation bug"
git push origin v1.4.2
```

#### GitHub Releases

Create a GitHub Release for each version tag with:

- Release title (e.g., "Version 1.4.2 - Bug Fixes")
- Changelog detailing what changed
- Links to relevant pull requests
- Known issues (if any)

### Branch Naming Convention

- **main** — Production-ready code (current stable release)
- **develop** — Integration branch for features (next release)
- **feature/feature-name** — New features
- **bugfix/bug-name** — Bug fixes
- **hotfix/issue-name** — Urgent production fixes

### Additional Resources

For more details about the rules and syntax, see [Semantic Versioning 2.0.0](https://semver.org/).

# Pull Request Strategy

## Overview
Our PR strategy uses a **three-tier merge process** across multiple agile teams:
1. **Individual Development** → Individual branches from `main`  
2. **Team Integration** → Team merge branches (`Team 1`, `Team 2`, `Team 3`, `Team 4`)  
3. **Final Integration** → Consolidated branch back to `main`

---

## 🧩 Stage 1: Individual Development

### Branching Convention
`<team-number>-<name>-<brief-description>`

**Examples:**
- `team-2-Kenuli-password_rest`
- `team-1-claire-inspection-debug`

> While this naming convention is recommended, we acknowledge that features may not always be named properly. This is acceptable as long as each team member knows which branch they are working on and can merge with the correct feature.

### ✅ Requirements Before Creating a PR
- All tests pass locally  
- The assigned feature works as intended  
- Code is linted and formatted  
- Documentation updated  
- Self-reviewed changes  

---

## 🤝 Stage 2: Team Integration

### Team Branch Convention
`<team-number>-M-<milestone-number>`

**Examples:**
- `Team4-M4`

### Team Collaborative Merge Meeting
**Attendees:** All team members  

**Process:**
1. Review each PR as a team (5–10 minutes per PR)  
2. Merge PRs sequentially, starting with foundational changes  
3. Address merge conflicts collaboratively  
4. Run integration tests after each merge  
5. Document technical debt or follow-up items  
6. Validate full test suite and functional testing  

### 🧾 Requirements Before Final Merge
- Peer code review completed (minimum 2 approvals)  
- All features work concurrently  
- Code coverage thresholds met  

---

## 🚀 Stage 3: Final Integration

### Final Branch Convention
`<team-number>-merge → main-<milestone-number>`

### Final Merge Meeting
**Attendees:** 1–2 representatives from each team  

**Process:**
Our final integration follows a **two-step merge process** rather than merging all teams simultaneously.

**Step 1 – Initial Pair Merges**
- Teams merge in pairs (e.g., `Team 1-2`, `Team 3-4`)  
- If a team is not ready, adjust groupings flexibly (e.g., `Team 3-4-1`, then `Team 2`)

**Step 2 – Final Consolidation**
- Merge the paired team branches into the final integration branch  

**Throughout the process:**
- Review sprint objectives and identify integration risks  
- Merge sequentially based on dependencies  
- Resolve cross-team conflicts collaboratively  
- Run integration tests after each merge  
- Complete full regression and performance testing  
- All representatives sign off on the final state  
- Create PR to `main`  

---

## 🧰 Common Issues & Troubleshooting

| **Issue** | **Cause** | **Solution** |
|------------|------------|---------------|
| **Meteor not running – Missing dependencies** | Have not installed the relevant dependencies for the app | See the terminal for the list of missing dependencies and commands, or run `npm install` |
| **Public API Key visible** | API key call made directly in the `.jsx` file (public repo) | Add the API key to a new file `settings.json` in the root directory, add it to `.gitignore`, and call the key from that file instead of embedding it in code |
| **App not launching** | Wrong root directory | Ensure you’re in the correct main directory before running the app — right-click `Application/all-in-one` and select “Open in Integrated Terminal” |
| **Installation and setup issues** | Meteor requires specific Node versions | Check version compatibility and download the correct one |
| **Cannot commit changes** | Missing GitHub credentials | Check the output window for missing author info, then run:<br>`git config user.name "Your Name"`<br>`git config user.email "your_email@example.com"` |
| **Port and connection problems** | Port (e.g. 3000) already in use | Move to another port or free up the current one |

---

## 📎 Appendix
**Repository Link:** [https://github.com/Monash-FIT3170/2025W1-All-In-One](https://github.com/Monash-FIT3170/2025W1-All-In-One)  
**Staging URL:** [https://all-in-one.meteorapp.com/](https://all-in-one.meteorapp.com/)  
**Drive Folder:** [Google Drive Folder](https://drive.google.com/drive/u/0/folders/1C3975g9mkwQXP0bz3upCeNzryFYqGf5C) *  
**Other Systems (ClickUp):** [https://app.clickup.com/9016824431/home](https://app.clickup.com/9016824431/home) *

> \* Request access for the links above.

---

## 🤖 Generative AI Statement
In this Handover Documentation, generative artificial intelligence tools were used only to refine language, improve clarity, and ensure a professional tone after the technical content was independently written by the contributors. AI assistance was also used to identify common and relevant sections typically included in handover documentation to ensure completeness.


