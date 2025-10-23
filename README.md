# 2025W1-All-In-One

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

## Installing Dependencies

The application uses the following dependencies, which can be installed by running `npm install` in the command prompt, followed by the name of the dependency:

- @babel/runtime  
- @fullcalendar/interaction  
- @fullcalendar/react  
- @fullcalendar/timegrid  
- heroicons/react  
- clone  
- dayjs  
- lucide-react  
- meteor-node-stubs  
- react  
- react-dom  
- react-icons  
- react-router  
- react-router-dom  
- react-slick  
- simpl-schema  
- slick-carousel  
- autoprefixer  
- postcss  
- tailwindcss  

## Running the Application Locally

```bash
# Without maps and API
meteor run
# or
meteor

# With map integration
meteor --settings settings.json

# Final run command with database
npx dotenv -e .env -- meteor run --settings settings.json
```

Visit http://localhost:3000 in your browser. Use the link generated in the terminal of your VS Code.

**Additional Notes:** A private key needs to be created locally in the main folder: `all-in-one-settings.json`. Add the API key to this file and add it to `.gitignore`. This ensures privacy of the API key.

## Project Structure (High-Level)

```
/client          →  React UI components
/server          →  Meteor server methods
/imports/api     →  Database collections & methods
/imports/ui      →  React dialogs, forms, views
/config          →  Environment & app configuration
/tests           →  Unit and integration tests
```

## Hardware Requirements

- **CPU:** Dual-core processor (Intel i5 or AMD equivalent)
- **RAM:** 8GB (16GB recommended)
- **Disk:** ~20GB free space
- **OS:** Windows 10+, macOS 12+, or Ubuntu 20.04+

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
