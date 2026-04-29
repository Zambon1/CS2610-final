import { Link } from "react-router";

function AuthForm({
  title,
  submitLabel,
  description,
  fields,
  values,
  setValue,
  error,
  onSubmit,
  footerText,
  footerLinkTo,
  footerLinkLabel,
  footerLinks,
  roleToggle,
  accentLabel,
}) {
  return (
    <div className="form-page auth-card">
      <p className="eyebrow">{accentLabel}</p>
      <h2>{title}</h2>
      {description && <p className="page-copy auth-copy">{description}</p>}
      {error && <p className="error-message">{error}</p>}
      {roleToggle}
      <form onSubmit={onSubmit}>
        {fields.map((field) => (
          <div className="form-group" key={field.id}>
            <label htmlFor={field.id}>{field.label}</label>
            <input
              id={field.id}
              type={field.type}
              value={values[field.id]}
              onChange={(e) => setValue(field.id, e.target.value)}
              required
            />
          </div>
        ))}
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </form>
      {(footerText || footerLinks || footerLinkTo) && (
        <p className="auth-footer">
          {footerText}
          {footerLinks?.length ? (
            <>
              {" "}
              {footerLinks.map((link, index) => (
                <span key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                  {index < footerLinks.length - 1 ? " | " : ""}
                </span>
              ))}
            </>
          ) : footerLinkTo ? (
            <>
              {" "}
              <Link to={footerLinkTo}>{footerLinkLabel}</Link>
            </>
          ) : null}
        </p>
      )}
    </div>
  );
}

export default AuthForm;