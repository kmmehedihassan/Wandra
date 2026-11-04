import React from "react";
import { formatDate } from "../../store";

const ViewProfile = ({ user, profile, onEdit }) => {
  const rows = [
    ["Username", user.username],
    ["Email", user.email],
    ["First name", profile.firstname],
    ["Last name", profile.lastname],
    ["Gender", profile.gender],
    ["Birthday", profile.birthday ? formatDate(profile.birthday) : ""],
    ["Phone", profile.phone],
    ["Address", profile.address],
  ];
  const incomplete = rows.some(([, value]) => !value);

  return (
    <>
      <div className="row-between">
        <h1 className="card-title mb-0">My profile</h1>
        <button type="button" className="btn btn-outline btn-sm" onClick={onEdit}>
          Edit profile
        </button>
      </div>
      {incomplete && <p className="muted small mt-1">Complete your profile so we can reach you about your trips.</p>}
      <dl className="detail-list mt-2">
        {rows.map(([label, value]) => (
          <React.Fragment key={label}>
            <dt>{label}</dt>
            <dd>{value || <span className="muted">Not set</span>}</dd>
          </React.Fragment>
        ))}
      </dl>
    </>
  );
};

export default ViewProfile;
