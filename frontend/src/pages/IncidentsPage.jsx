import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  addTicketComment,
  addIncidentAttachments,
  assignIncidentTechnician,
  createIncidentTicket,
  deleteIncidentAttachment,
  deleteIncidentTicket,
  deleteTicketComment,
  downloadIncidentAttachment,
  getIncidentTicket,
  listIncidentTickets,
  listTicketComments,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  updateIncidentTicket,
  updateTicketComment,
} from "../services/incidentService";
import {
  createTechnician,
  deleteTechnician,
  listTechnicians,
  updateTechnician,
} from "../services/technicianService";
import "./IncidentsPage.css";

const defaultCreateForm = {
  resourceLocation: "",
  category: "",
  description: "",
  priority: "MEDIUM",
  preferredContactDetails: "",
};

const defaultEditForm = {
  resourceLocation: "",
  category: "",
  description: "",
  priority: "MEDIUM",
  preferredContactDetails: "",
  status: "OPEN",
  resolutionNotes: "",
  assignedTechnicianId: "",
};

const defaultTechnicianForm = {
  name: "",
  email: "",
  password: "",
};

const formatDateTime = (value) => {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleString();
};

const statusClassName = (status) =>
  (status || "").toLowerCase().replaceAll("_", "-");

export default function IncidentsPage() {
  const { user, isAuthenticated } = useAuth();

  const backendActorUserId = useMemo(() => {
    if (!user) {
      return null;
    }

    if (Number.isInteger(user.backendUserId)) {
      return user.backendUserId;
    }

    if (Number.isInteger(user.id) && user.id > 0 && user.id <= 3) {
      return user.id;
    }

    if (user.role === "ADMIN") {
      return 1;
    }

    if (user.role === "TECHNICIAN") {
      return 3;
    }

    return 2;
  }, [user]);

  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comments, setComments] = useState([]);

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [createForm, setCreateForm] = useState(defaultCreateForm);
  const [createFiles, setCreateFiles] = useState([]);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editTicketForm, setEditTicketForm] = useState(defaultEditForm);
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);

  const [technicians, setTechnicians] = useState([]);
  const [isTechnicianFormOpen, setIsTechnicianFormOpen] = useState(false);
  const [technicianForm, setTechnicianForm] = useState(defaultTechnicianForm);
  const [editingTechnicianId, setEditingTechnicianId] = useState(null);
  const [editTechnicianForm, setEditTechnicianForm] = useState(defaultTechnicianForm);

  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [attachmentFilesToAdd, setAttachmentFilesToAdd] = useState([]);

  const [listLoading, setListLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateTicketLoading, setUpdateTicketLoading] = useState(false);
  const [deleteTicketLoading, setDeleteTicketLoading] = useState(false);
  const [addAttachmentLoading, setAddAttachmentLoading] = useState(false);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState(null);
  const [technicianLoading, setTechnicianLoading] = useState(false);
  const [technicianActionLoading, setTechnicianActionLoading] = useState(false);
  const [deletingTechnicianId, setDeletingTechnicianId] = useState(null);

  const [pageError, setPageError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const canCreateTicket = isAuthenticated;
  const canAssignTechnician = user?.role === "ADMIN";

  const canManageTicketDetails =
    !!selectedTicket &&
    (user?.role === "ADMIN" || selectedTicket?.reporterId === backendActorUserId);

  const canCommentOnTicket =
    !!selectedTicket &&
    (user?.role === "ADMIN" ||
      user?.role === "TECHNICIAN" ||
      selectedTicket?.reporterId === backendActorUserId);

  const clearMessages = () => {
    setPageError("");
    setActionMessage("");
  };

  const loadTicketDetails = async (ticketId) => {
    if (!backendActorUserId || !ticketId) {
      setSelectedTicket(null);
      setComments([]);
      setEditTicketForm(defaultEditForm);
      setAttachmentFilesToAdd([]);
      return;
    }

    setDetailsLoading(true);
    setPageError("");

    try {
      const ticket = await getIncidentTicket(ticketId, backendActorUserId);
      setSelectedTicket(ticket);
      setEditTicketForm({
        resourceLocation: ticket.resourceLocation || "",
        category: ticket.category || "",
        description: ticket.description || "",
        priority: ticket.priority || "MEDIUM",
        preferredContactDetails: ticket.preferredContactDetails || "",
        status: ticket.status || "OPEN",
        resolutionNotes: ticket.resolutionNotes || "",
        assignedTechnicianId: ticket.assignedTechnicianId ? `${ticket.assignedTechnicianId}` : "",
      });
      setAttachmentFilesToAdd([]);

      setCommentLoading(true);
      try {
        const ticketComments = await listTicketComments(ticketId, backendActorUserId);
        setComments(Array.isArray(ticketComments) ? ticketComments : []);
      } catch {
        setComments(Array.isArray(ticket.comments) ? ticket.comments : []);
      } finally {
        setCommentLoading(false);
      }
    } catch (error) {
      setPageError(error.message);
      setSelectedTicket(null);
      setComments([]);
      setEditTicketForm(defaultEditForm);
      setAttachmentFilesToAdd([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  const loadTickets = async (preferredTicketId) => {
    if (!backendActorUserId) {
      setTickets([]);
      setSelectedTicket(null);
      setComments([]);
      setEditTicketForm(defaultEditForm);
      return;
    }

    setListLoading(true);
    setPageError("");

    try {
      const nextStatus = statusFilter === "ALL" ? undefined : statusFilter;
      const data = await listIncidentTickets(backendActorUserId, nextStatus);
      const safeTickets = Array.isArray(data) ? data : [];
      setTickets(safeTickets);

      const selectedCandidate =
        preferredTicketId !== undefined ? preferredTicketId : selectedTicketId;

      const hasCurrent = safeTickets.some((item) => item.id === selectedCandidate);
      const finalTicketId = hasCurrent
        ? selectedCandidate
        : safeTickets.length > 0
          ? safeTickets[0].id
          : null;

      setSelectedTicketId(finalTicketId);

      if (finalTicketId) {
        await loadTicketDetails(finalTicketId);
      } else {
        setSelectedTicket(null);
        setComments([]);
        setEditTicketForm(defaultEditForm);
      }
    } catch (error) {
      setPageError(error.message);
      setTickets([]);
      setSelectedTicket(null);
      setComments([]);
      setEditTicketForm(defaultEditForm);
    } finally {
      setListLoading(false);
    }
  };

  const loadTechnicians = async () => {
    if (!backendActorUserId || !canAssignTechnician) {
      setTechnicians([]);
      return;
    }

    setTechnicianLoading(true);

    try {
      const data = await listTechnicians(backendActorUserId);
      setTechnicians(Array.isArray(data) ? data : []);
    } catch (error) {
      setPageError(error.message);
      setTechnicians([]);
    } finally {
      setTechnicianLoading(false);
    }
  };

  useEffect(() => {
    if (!backendActorUserId) {
      return;
    }

    loadTickets();
  }, [backendActorUserId, statusFilter]);

  useEffect(() => {
    if (!canAssignTechnician || !backendActorUserId) {
      setTechnicians([]);
      return;
    }

    loadTechnicians();
  }, [backendActorUserId, canAssignTechnician]);

  const handleCreateFieldChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length > 3) {
      setPageError("Only up to 3 image attachments are allowed per ticket.");
      return;
    }

    const nonImage = selectedFiles.some((file) => !file.type.startsWith("image/"));
    if (nonImage) {
      setPageError("Only image files are allowed.");
      return;
    }

    setCreateFiles(selectedFiles);
    setPageError("");
  };

  const handleAttachmentFilesToAddChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const existingCount = selectedTicket?.attachments?.length || 0;

    if (selectedFiles.length === 0) {
      setAttachmentFilesToAdd([]);
      return;
    }

    if (existingCount + selectedFiles.length > 3) {
      setPageError("A ticket can include up to 3 image attachments in total.");
      return;
    }

    const nonImage = selectedFiles.some((file) => !file.type.startsWith("image/"));
    if (nonImage) {
      setPageError("Only image files are allowed.");
      return;
    }

    setAttachmentFilesToAdd(selectedFiles);
    setPageError("");
  };

  const handleCreateTicket = async (event) => {
    event.preventDefault();

    if (!backendActorUserId) {
      return;
    }

    if (createFiles.length > 3) {
      setPageError("Only up to 3 image attachments are allowed per ticket.");
      return;
    }

    clearMessages();
    setCreateLoading(true);

    try {
      const createdTicket = await createIncidentTicket(
        {
          reporterId: backendActorUserId,
          resourceLocation: createForm.resourceLocation,
          category: createForm.category,
          description: createForm.description,
          priority: createForm.priority,
          preferredContactDetails: createForm.preferredContactDetails,
        },
        createFiles
      );

      setActionMessage(`Ticket #${createdTicket.id} created successfully.`);
      setCreateForm(defaultCreateForm);
      setCreateFiles([]);
      setIsCreateFormOpen(false);
      setStatusFilter("ALL");
      await loadTickets(createdTicket.id);
    } catch (error) {
      setPageError(error.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditTicketFieldChange = (event) => {
    const { name, value } = event.target;
    setEditTicketForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket?.id || !backendActorUserId) {
      return;
    }

    clearMessages();
    setUpdateTicketLoading(true);

    try {
      await updateIncidentTicket(selectedTicket.id, {
        actorUserId: backendActorUserId,
        resourceLocation: editTicketForm.resourceLocation,
        category: editTicketForm.category,
        description: editTicketForm.description,
        priority: editTicketForm.priority,
        preferredContactDetails: editTicketForm.preferredContactDetails,
        status: editTicketForm.status,
        resolutionNotes: editTicketForm.resolutionNotes || undefined,
      });

      // Assign technician if changed
      const currentTechId = selectedTicket.assignedTechnicianId
        ? `${selectedTicket.assignedTechnicianId}`
        : "";
      if (
        canAssignTechnician &&
        editTicketForm.assignedTechnicianId !== currentTechId &&
        editTicketForm.assignedTechnicianId
      ) {
        await assignIncidentTechnician(selectedTicket.id, {
          actorUserId: backendActorUserId,
          technicianUserId: Number(editTicketForm.assignedTechnicianId),
        });
      }

      setActionMessage("Ticket updated successfully.");
      setIsUpdateFormOpen(false);
      await loadTickets(selectedTicket.id);
    } catch (error) {
      setPageError(error.message);
    } finally {
      setUpdateTicketLoading(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!selectedTicket?.id || !backendActorUserId) {
      return;
    }

    const proceed = window.confirm(
      `Delete ticket #${selectedTicket.id}? This will also remove its comments and attachments.`
    );

    if (!proceed) {
      return;
    }

    clearMessages();
    setDeleteTicketLoading(true);

    try {
      const deletedTicketId = selectedTicket.id;
      await deleteIncidentTicket(deletedTicketId, backendActorUserId);
      setActionMessage(`Ticket #${deletedTicketId} deleted.`);
      setSelectedTicketId(null);
      await loadTickets(null);
    } catch (error) {
      setPageError(error.message);
    } finally {
      setDeleteTicketLoading(false);
    }
  };

  const handleAddAttachments = async () => {
    if (!selectedTicket?.id || !backendActorUserId || attachmentFilesToAdd.length === 0) {
      return;
    }

    clearMessages();
    setAddAttachmentLoading(true);

    try {
      await addIncidentAttachments(
        selectedTicket.id,
        backendActorUserId,
        attachmentFilesToAdd
      );

      setAttachmentFilesToAdd([]);
      setActionMessage("Attachments updated successfully.");
      await loadTickets(selectedTicket.id);
    } catch (error) {
      setPageError(error.message);
    } finally {
      setAddAttachmentLoading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!selectedTicket?.id || !backendActorUserId || !attachmentId) {
      return;
    }

    const proceed = window.confirm("Delete this attachment?");
    if (!proceed) {
      return;
    }

    clearMessages();
    setDeletingAttachmentId(attachmentId);

    try {
      await deleteIncidentAttachment(selectedTicket.id, attachmentId, backendActorUserId);
      setActionMessage("Attachment deleted.");
      await loadTickets(selectedTicket.id);
    } catch (error) {
      setPageError(error.message);
    } finally {
      setDeletingAttachmentId(null);
    }
  };

  const handleSelectTicket = async (ticketId) => {
    setSelectedTicketId(ticketId);
    setIsUpdateFormOpen(false);
    await loadTicketDetails(ticketId);
  };


  const handleTechnicianFieldChange = (event) => {
    const { name, value } = event.target;
    setTechnicianForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditTechnicianFieldChange = (event) => {
    const { name, value } = event.target;
    setEditTechnicianForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTechnician = async (event) => {
    event.preventDefault();

    if (!backendActorUserId || !canAssignTechnician) {
      return;
    }

    clearMessages();
    setTechnicianActionLoading(true);

    try {
      await createTechnician({
        actorUserId: backendActorUserId,
        name: technicianForm.name,
        email: technicianForm.email,
        password: technicianForm.password,
      });

      setActionMessage("Technician created successfully.");
      setTechnicianForm(defaultTechnicianForm);
      setIsTechnicianFormOpen(false);
      await loadTechnicians();
    } catch (error) {
      setPageError(error.message);
    } finally {
      setTechnicianActionLoading(false);
    }
  };

  const handleStartEditTechnician = (technician) => {
    setEditingTechnicianId(technician.id);
    setEditTechnicianForm({
      name: technician.name || "",
      email: technician.email || "",
      password: "",
    });
  };

  const handleCancelEditTechnician = () => {
    setEditingTechnicianId(null);
    setEditTechnicianForm(defaultTechnicianForm);
  };

  const handleSaveTechnician = async () => {
    if (!editingTechnicianId || !backendActorUserId || !canAssignTechnician) {
      return;
    }

    clearMessages();
    setTechnicianActionLoading(true);

    try {
      const payload = {
        actorUserId: backendActorUserId,
        name: editTechnicianForm.name,
        email: editTechnicianForm.email,
      };

      if (editTechnicianForm.password.trim()) {
        payload.password = editTechnicianForm.password;
      }

      await updateTechnician(editingTechnicianId, payload);

      setActionMessage("Technician updated successfully.");
      handleCancelEditTechnician();
      await loadTechnicians();
      if (selectedTicket?.id) {
        await loadTicketDetails(selectedTicket.id);
      }
    } catch (error) {
      setPageError(error.message);
    } finally {
      setTechnicianActionLoading(false);
    }
  };

  const handleDeleteTechnicianRecord = async (technicianId) => {
    if (!technicianId || !backendActorUserId || !canAssignTechnician) {
      return;
    }

    const proceed = window.confirm(
      "Delete this technician? Assigned tickets will be unassigned."
    );

    if (!proceed) {
      return;
    }

    clearMessages();
    setDeletingTechnicianId(technicianId);

    try {
      await deleteTechnician(technicianId, backendActorUserId);
      setActionMessage("Technician deleted successfully.");

      if (editingTechnicianId === technicianId) {
        handleCancelEditTechnician();
      }

      await loadTechnicians();
      if (selectedTicket?.id) {
        await loadTicketDetails(selectedTicket.id);
      }
    } catch (error) {
      setPageError(error.message);
    } finally {
      setDeletingTechnicianId(null);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket?.id || !newComment.trim() || !backendActorUserId) {
      return;
    }

    clearMessages();

    try {
      await addTicketComment(selectedTicket.id, {
        actorUserId: backendActorUserId,
        content: newComment.trim(),
      });

      setNewComment("");
      setActionMessage("Comment added.");
      await loadTicketDetails(selectedTicket.id);
    } catch (error) {
      setPageError(error.message);
    }
  };

  const handleStartEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.content);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const handleSaveEditComment = async () => {
    if (!selectedTicket?.id || !editingCommentId || !editingCommentText.trim() || !backendActorUserId) {
      return;
    }

    clearMessages();

    try {
      await updateTicketComment(selectedTicket.id, editingCommentId, {
        actorUserId: backendActorUserId,
        content: editingCommentText.trim(),
      });

      setActionMessage("Comment updated.");
      handleCancelEditComment();
      await loadTicketDetails(selectedTicket.id);
    } catch (error) {
      setPageError(error.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!selectedTicket?.id || !commentId || !backendActorUserId) {
      return;
    }

    const proceed = window.confirm("Delete this comment?");
    if (!proceed) {
      return;
    }

    clearMessages();

    try {
      await deleteTicketComment(selectedTicket.id, commentId, backendActorUserId);
      setActionMessage("Comment deleted.");
      await loadTicketDetails(selectedTicket.id);
    } catch (error) {
      setPageError(error.message);
    }
  };

  const handleAttachmentOpen = async (attachment) => {
    if (!selectedTicket?.id || !attachment?.id || !backendActorUserId) {
      return;
    }

    clearMessages();

    try {
      const blob = await downloadIncidentAttachment(
        selectedTicket.id,
        attachment.id,
        backendActorUserId
      );

      const objectUrl = URL.createObjectURL(blob);
      const fileName = attachment.fileName || `attachment-${attachment.id}`;

      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = fileName;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
    } catch (error) {
      setPageError(error.message);
    }
  };

  if (!isAuthenticated || !backendActorUserId) {
    return (
      <div className="inc-page">
        <div className="inc-shell inc-auth-box">
          <h2>Incident Ticketing</h2>
          <p>Please log in to create and manage incident tickets.</p>
          <Link to="/login" className="inc-primary-link">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="inc-page">
      <div className="inc-shell">
        <header className="inc-header">
          <div>
            <h1>Maintenance & Incident Ticketing</h1>
            <p>
              Create issues with evidence, assign technicians, track workflow,
              and collaborate through comments.
            </p>
          </div>
          <button
            type="button"
            className="inc-outline-btn"
            onClick={() => loadTickets(selectedTicketId)}
            disabled={listLoading}
          >
            {listLoading ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        {pageError && <div className="inc-alert inc-alert-error">{pageError}</div>}
        {actionMessage && (
          <div className="inc-alert inc-alert-success">{actionMessage}</div>
        )}

        <div className="inc-grid">
          <section className="inc-left-column">
            {canCreateTicket && (
              <article className="inc-panel">
                <div className="inc-panel-head">
                  <h2>Create Incident Ticket</h2>
                  <button
                    type="button"
                    className="inc-outline-btn"
                    onClick={() => setIsCreateFormOpen((prev) => !prev)}
                  >
                    {isCreateFormOpen ? "Close" : "Create"}
                  </button>
                </div>

                {!isCreateFormOpen && (
                  <p className="inc-muted">Click Create to open the ticket form.</p>
                )}

                {isCreateFormOpen && (
                  <form onSubmit={handleCreateTicket} className="inc-form">
                    <label>
                      Resource / Location
                      <input
                        type="text"
                        name="resourceLocation"
                        value={createForm.resourceLocation}
                        onChange={handleCreateFieldChange}
                        placeholder="Lab 2 - Projector"
                        required
                      />
                    </label>

                    <label>
                      Category
                      <input
                        type="text"
                        name="category"
                        value={createForm.category}
                        onChange={handleCreateFieldChange}
                        placeholder="Projector / Network / Electrical"
                        required
                      />
                    </label>

                    <label>
                      Priority
                      <select
                        name="priority"
                        value={createForm.priority}
                        onChange={handleCreateFieldChange}
                      >
                        {TICKET_PRIORITIES.map((priority) => (
                          <option key={priority} value={priority}>
                            {priority}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Preferred Contact Details
                      <input
                        type="text"
                        name="preferredContactDetails"
                        value={createForm.preferredContactDetails}
                        onChange={handleCreateFieldChange}
                        placeholder="077-1234567 / user@campus.com"
                        required
                      />
                    </label>

                    <label>
                      Description
                      <textarea
                        name="description"
                        value={createForm.description}
                        onChange={handleCreateFieldChange}
                        rows={5}
                        placeholder="Describe the issue and impact..."
                        required
                      />
                    </label>

                    <label>
                      Evidence Images (up to 3)
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                      />
                    </label>

                    {createFiles.length > 0 && (
                      <div className="inc-file-list">
                        {createFiles.map((file) => (
                          <span key={file.name + file.size} className="inc-chip">
                            {file.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="inc-primary-btn"
                      disabled={createLoading}
                    >
                      {createLoading ? "Submitting..." : "Create Ticket"}
                    </button>
                  </form>
                )}
              </article>
            )}

            {canAssignTechnician && (
              <article className="inc-panel">
                <div className="inc-panel-head">
                  <h2>Technician Management</h2>
                  <button
                    type="button"
                    className="inc-outline-btn"
                    onClick={() => setIsTechnicianFormOpen((prev) => !prev)}
                  >
                    {isTechnicianFormOpen ? "Close" : "Add Technician"}
                  </button>
                </div>

                {!isTechnicianFormOpen && (
                  <p className="inc-muted">
                    Manage technician accounts used for incident assignment.
                  </p>
                )}

                {isTechnicianFormOpen && (
                  <form className="inc-form" onSubmit={handleCreateTechnician}>
                    <label>
                      Name
                      <input
                        type="text"
                        name="name"
                        value={technicianForm.name}
                        onChange={handleTechnicianFieldChange}
                        required
                      />
                    </label>

                    <label>
                      Email
                      <input
                        type="email"
                        name="email"
                        value={technicianForm.email}
                        onChange={handleTechnicianFieldChange}
                        required
                      />
                    </label>

                    <label>
                      Password
                      <input
                        type="password"
                        name="password"
                        value={technicianForm.password}
                        onChange={handleTechnicianFieldChange}
                        minLength={6}
                        required
                      />
                    </label>

                    <button
                      type="submit"
                      className="inc-primary-btn"
                      disabled={technicianActionLoading}
                    >
                      {technicianActionLoading ? "Saving..." : "Create Technician"}
                    </button>
                  </form>
                )}

                {technicianLoading && <p className="inc-muted">Loading technicians...</p>}

                {!technicianLoading && technicians.length === 0 && (
                  <p className="inc-muted">No active technicians found.</p>
                )}

                {!technicianLoading && technicians.length > 0 && (
                  <div className="inc-tech-list">
                    {technicians.map((tech) => (
                      <article key={tech.id} className="inc-tech-card">
                        {editingTechnicianId === tech.id ? (
                          <div className="inc-tech-edit-grid">
                            <label>
                              Name
                              <input
                                type="text"
                                name="name"
                                value={editTechnicianForm.name}
                                onChange={handleEditTechnicianFieldChange}
                                required
                              />
                            </label>

                            <label>
                              Email
                              <input
                                type="email"
                                name="email"
                                value={editTechnicianForm.email}
                                onChange={handleEditTechnicianFieldChange}
                                required
                              />
                            </label>

                            <label>
                              New Password (optional)
                              <input
                                type="password"
                                name="password"
                                value={editTechnicianForm.password}
                                onChange={handleEditTechnicianFieldChange}
                                minLength={6}
                              />
                            </label>

                            <div className="inc-comment-actions">
                              <button
                                type="button"
                                className="inc-primary-btn"
                                onClick={handleSaveTechnician}
                                disabled={technicianActionLoading}
                              >
                                {technicianActionLoading ? "Saving..." : "Save"}
                              </button>
                              <button
                                type="button"
                                className="inc-outline-btn"
                                onClick={handleCancelEditTechnician}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="inc-tech-meta">
                              <strong>{tech.name}</strong>
                              <small>{tech.email}</small>
                              <span>Technician ID: {tech.id}</span>
                            </div>
                            <div className="inc-comment-actions">
                              <button
                                type="button"
                                className="inc-outline-btn"
                                onClick={() => handleStartEditTechnician(tech)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="inc-outline-btn danger"
                                onClick={() => handleDeleteTechnicianRecord(tech.id)}
                                disabled={deletingTechnicianId === tech.id}
                              >
                                {deletingTechnicianId === tech.id ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          </>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </article>
            )}

            <article className="inc-panel">
              <div className="inc-panel-head">
                <h2>Tickets</h2>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  {TICKET_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {listLoading && <p className="inc-muted">Loading tickets...</p>}

              {!listLoading && tickets.length === 0 && (
                <p className="inc-muted">No tickets found for the current filter.</p>
              )}

              <div className="inc-ticket-list">
                {tickets.map((ticket) => (
                  <button
                    type="button"
                    key={ticket.id}
                    className={`inc-ticket-item ${
                      selectedTicketId === ticket.id ? "active" : ""
                    }`}
                    onClick={() => handleSelectTicket(ticket.id)}
                  >
                    <div className="inc-ticket-item-head">
                      <strong>#{ticket.id}</strong>
                      <span
                        className={`inc-status-badge ${statusClassName(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                    <p>{ticket.category}</p>
                    <small>{ticket.resourceLocation}</small>
                  </button>
                ))}
              </div>
            </article>
          </section>

          <section className="inc-right-column">
            <article className="inc-panel inc-panel-stretch">
              {detailsLoading && <p className="inc-muted">Loading ticket details...</p>}

              {!detailsLoading && !selectedTicket && (
                <p className="inc-muted">Select a ticket to view details.</p>
              )}

              {!detailsLoading && selectedTicket && (
                <>
                  <div className="inc-ticket-detail-head">
                    <div>
                      <h2>Ticket #{selectedTicket.id}</h2>
                      <p>{selectedTicket.category}</p>
                    </div>
                    <div className="inc-pill-group">
                      <span className="inc-pill">{selectedTicket.priority}</span>
                      <span
                        className={`inc-status-badge ${statusClassName(
                          selectedTicket.status
                        )}`}
                      >
                        {selectedTicket.status}
                      </span>
                    </div>
                  </div>

                  <div className="inc-meta-grid">
                    <div>
                      <strong>Reporter</strong>
                      <p>{selectedTicket.reporterName}</p>
                    </div>
                    <div>
                      <strong>Assigned Technician</strong>
                      <p>{selectedTicket.assignedTechnicianName || "Not assigned"}</p>
                    </div>
                    <div>
                      <strong>Location</strong>
                      <p>{selectedTicket.resourceLocation}</p>
                    </div>
                    <div>
                      <strong>Preferred Contact</strong>
                      <p>{selectedTicket.preferredContactDetails}</p>
                    </div>
                    <div>
                      <strong>Created</strong>
                      <p>{formatDateTime(selectedTicket.createdAt)}</p>
                    </div>
                    <div>
                      <strong>Updated</strong>
                      <p>{formatDateTime(selectedTicket.updatedAt)}</p>
                    </div>
                  </div>

                  <div className="inc-description-box">
                    <strong>Description</strong>
                    <p>{selectedTicket.description}</p>
                  </div>

                  {canManageTicketDetails && (
                    <div className="inc-section">
                      <h3>Ticket Actions</h3>
                      <div className="inc-ticket-actions">
                        <button
                          type="button"
                          className="inc-outline-btn"
                          onClick={() => setIsUpdateFormOpen((prev) => !prev)}
                        >
                          {isUpdateFormOpen ? "Close Update Form" : "Update Ticket"}
                        </button>

                        <button
                          type="button"
                          className="inc-outline-btn danger"
                          onClick={handleDeleteTicket}
                          disabled={deleteTicketLoading}
                        >
                          {deleteTicketLoading ? "Deleting..." : "Delete Ticket"}
                        </button>
                      </div>

                      {isUpdateFormOpen && (
                        <div className="inc-form">
                          <label>
                            Resource / Location
                            <input
                              type="text"
                              name="resourceLocation"
                              value={editTicketForm.resourceLocation}
                              onChange={handleEditTicketFieldChange}
                              required
                            />
                          </label>

                          <label>
                            Category
                            <input
                              type="text"
                              name="category"
                              value={editTicketForm.category}
                              onChange={handleEditTicketFieldChange}
                              required
                            />
                          </label>

                          <label>
                            Priority
                            <select
                              name="priority"
                              value={editTicketForm.priority}
                              onChange={handleEditTicketFieldChange}
                            >
                              {TICKET_PRIORITIES.map((priority) => (
                                <option key={priority} value={priority}>
                                  {priority}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label>
                            Status
                            <select
                              name="status"
                              value={editTicketForm.status}
                              onChange={handleEditTicketFieldChange}
                            >
                              {TICKET_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </label>

                          {canAssignTechnician && technicians.length > 0 && (
                            <label>
                              Assign Technician
                              <select
                                name="assignedTechnicianId"
                                value={editTicketForm.assignedTechnicianId}
                                onChange={handleEditTicketFieldChange}
                              >
                                <option value="">— No change / keep current —</option>
                                {technicians.map((tech) => (
                                  <option key={tech.id} value={`${tech.id}`}>
                                    {tech.name} ({tech.email})
                                  </option>
                                ))}
                              </select>
                            </label>
                          )}

                          {(editTicketForm.status === "RESOLVED" ||
                            editTicketForm.status === "CLOSED") && (
                            <label>
                              Resolution Notes
                              {editTicketForm.status === "CLOSED" && !editTicketForm.resolutionNotes && !selectedTicket.resolutionNotes ? (
                                <span className="inc-field-hint"> (required to close)</span>
                              ) : null}
                              <textarea
                                rows={3}
                                name="resolutionNotes"
                                value={editTicketForm.resolutionNotes}
                                onChange={handleEditTicketFieldChange}
                                placeholder="Describe what was done to resolve this issue..."
                              />
                            </label>
                          )}

                          <label>
                            Preferred Contact Details
                            <input
                              type="text"
                              name="preferredContactDetails"
                              value={editTicketForm.preferredContactDetails}
                              onChange={handleEditTicketFieldChange}
                              required
                            />
                          </label>

                          <label>
                            Description
                            <textarea
                              rows={4}
                              name="description"
                              value={editTicketForm.description}
                              onChange={handleEditTicketFieldChange}
                              required
                            />
                          </label>

                          <button
                            type="button"
                            className="inc-primary-btn"
                            onClick={handleUpdateTicket}
                            disabled={updateTicketLoading}
                          >
                            {updateTicketLoading ? "Updating..." : "Save Ticket Changes"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedTicket.rejectionReason && (
                    <div className="inc-note-box reject">
                      <strong>Rejection Reason</strong>
                      <p>{selectedTicket.rejectionReason}</p>
                    </div>
                  )}

                  {selectedTicket.resolutionNotes && (
                    <div className="inc-note-box resolve">
                      <strong>Resolution Notes</strong>
                      <p>{selectedTicket.resolutionNotes}</p>
                    </div>
                  )}

                  <div className="inc-section">
                    <h3>Attachments</h3>
                    {selectedTicket.attachments?.length ? (
                      <div className="inc-file-list">
                        {selectedTicket.attachments.map((attachment) => (
                          <div key={attachment.id} className="inc-chip-row">
                            <button
                              type="button"
                              className="inc-chip inc-chip-button"
                              onClick={() => handleAttachmentOpen(attachment)}
                            >
                              {attachment.fileName}
                            </button>
                            {canManageTicketDetails && (
                              <button
                                type="button"
                                className="inc-outline-btn danger inc-attachment-delete-btn"
                                onClick={() => handleDeleteAttachment(attachment.id)}
                                disabled={deletingAttachmentId === attachment.id}
                              >
                                {deletingAttachmentId === attachment.id ? "Removing..." : "Remove"}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="inc-muted">No attachments provided.</p>
                    )}

                    {canManageTicketDetails && (
                      <div className="inc-attachment-tools">
                        <label>
                          Add Attachment Images (max total: 3)
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleAttachmentFilesToAddChange}
                          />
                        </label>

                        {attachmentFilesToAdd.length > 0 && (
                          <div className="inc-file-list">
                            {attachmentFilesToAdd.map((file) => (
                              <span key={file.name + file.size} className="inc-chip">
                                {file.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <button
                          type="button"
                          className="inc-primary-btn"
                          onClick={handleAddAttachments}
                          disabled={addAttachmentLoading || attachmentFilesToAdd.length === 0}
                        >
                          {addAttachmentLoading ? "Uploading..." : "Upload Attachments"}
                        </button>
                      </div>
                    )}
                  </div>



                  <div className="inc-section">
                    <h3>Comments</h3>

                    {commentLoading && <p className="inc-muted">Loading comments...</p>}

                    {!commentLoading && comments.length === 0 && (
                      <p className="inc-muted">No comments yet.</p>
                    )}

                    <div className="inc-comments">
                      {comments.map((comment) => {
                        const canModifyComment =
                          user?.role === "ADMIN" || comment.authorId === backendActorUserId;

                        return (
                          <article key={comment.id} className="inc-comment-card">
                            <div className="inc-comment-head">
                              <div>
                                <strong>{comment.authorName}</strong>
                                <span>{comment.authorRole}</span>
                              </div>
                              <small>{formatDateTime(comment.updatedAt)}</small>
                            </div>

                            {editingCommentId === comment.id ? (
                              <>
                                <textarea
                                  rows={3}
                                  value={editingCommentText}
                                  onChange={(event) =>
                                    setEditingCommentText(event.target.value)
                                  }
                                />
                                <div className="inc-comment-actions">
                                  <button
                                    type="button"
                                    className="inc-primary-btn"
                                    onClick={handleSaveEditComment}
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    className="inc-outline-btn"
                                    onClick={handleCancelEditComment}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <p>{comment.content}</p>
                                {canModifyComment && (
                                  <div className="inc-comment-actions">
                                    <button
                                      type="button"
                                      className="inc-outline-btn"
                                      onClick={() => handleStartEditComment(comment)}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      className="inc-outline-btn danger"
                                      onClick={() => handleDeleteComment(comment.id)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </article>
                        );
                      })}
                    </div>

                    {canCommentOnTicket && (
                      <div className="inc-comment-compose">
                        <textarea
                          rows={3}
                          placeholder="Write a comment..."
                          value={newComment}
                          onChange={(event) => setNewComment(event.target.value)}
                        />
                        <button
                          type="button"
                          className="inc-primary-btn"
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                        >
                          Add Comment
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </article>
          </section>
        </div>
      </div>
    </div>
  );
}
