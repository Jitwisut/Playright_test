# Visitor Registration Field Inventory

Inspected from the live DOM on 2026-08-10 at:

`https://registration.expopass.co/register/form/kiso26/ThqcXW`

## Form contract

| Property | Observed value |
| --- | --- |
| Form id | `registerV5Form` |
| Method | `POST` |
| Action | `https://registration.expopass.co/registrationv5/save_page/kiso26/ThqcXW` |
| Page title | `Visitor Pre-Registration` |
| Main heading | `Registrant Information` |
| Default verification | hCaptcha checkbox iframe |

## Controls

| Field | DOM locator / accessible name | Type | Required | Observed constraints |
| --- | --- | --- | --- | --- |
| Email | `getByLabel('Email (อีเมล)')`, `#pf_userEmail` | email | No | `maxlength=50`, email pattern, autocomplete email |
| Confirm Email | `getByLabel('Confirm Email')`, `#pf_userEmail_confirm` | email | No | `maxlength=50`, email pattern |
| First Name | `#pf_userFname` | text | Yes | `minlength=2`, `maxlength=50`, Unicode-aware pattern |
| Job Title | `#pf_userTitle` | native select | Yes | Placeholder plus Mr., Miss, Mrs., Other |
| Other Job Title | `#pf_userTitle_other` | text | Conditional | Hidden until Other is selected, `maxlength=50` |
| Last Name | `#pf_userLname` | text | Yes | `minlength=2`, `maxlength=50`, Unicode-aware pattern |
| Company | `#pf_companyName` | text | No | `minlength=2`, `maxlength=50`, Unicode-aware pattern |
| Position | `#pf_position` | text | No | `minlength=2`, `maxlength=50`, Unicode-aware pattern |
| Mobile | `#pf_mobile` | tel | No | Intl-tel UI, default country Thailand / `+66` |
| Mobile country code | Accessible combobox `Telephone country code` | custom combobox | No | Initial title `Thailand (ไทย)` |
| Country | `#pf_countryID` | native select + Select2 UI | No | Large country list; Thailand value `212` |
| Color | `#pf_color` | text + native color picker preview | No | `maxlength=9`, hex pattern `^#[0-9a-fA-F]{3,8}$` |
| Industry | Radio group | radio | Yes | Government & Public Services, Energy, Transportation |
| Profile upload | `#pf_imgProfile`, upload button | file | No | Accepts `.jpg,.jpeg,.png,.gif`, single file, `data-drag-drop=0` |
| Verification | iframe title containing `hCaptcha` | checkbox in iframe | External | Do not solve or bypass in automation |
| Submit | `getByRole('button', { name: 'Submit' })` | submit button | N/A | Client-side validation and verification gate |

## Safety observations

- The live form action and upload endpoint are production-like.
- The automated fixture blocks registration and upload endpoints by default.
- Test data is synthetic; no real registration or CAPTCHA solve is performed.
