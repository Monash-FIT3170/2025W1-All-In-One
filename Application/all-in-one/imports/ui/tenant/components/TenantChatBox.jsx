import React, { useEffect, useMemo, useRef, useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import {
  Agents,
  Messages,
  Properties,
  RentalApplications,
  Tenants,
} from "../../../api/database/collections";

const APPROVED_TOKENS = new Set(["approved", "accepted"]);

const buildAgentLabel = ({ agentName, agentEmail, properties }) => {
  const namePart = agentName || agentEmail || "Assigned Agent";
  if (!properties || properties.length === 0) return namePart;
  if (properties.length === 1) return `${namePart} – ${properties[0]}`;
  const [first, ...rest] = properties;
  return `${namePart} – ${first}${rest.length ? ` (+${rest.length} more)` : ""}`;
};

export const TenantChatBox = () => {
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const tenantId = Meteor.userId();

  const { agentOptions, loadingAgents } = useTracker(() => {
    if (!tenantId) {
      return { agentOptions: [], loadingAgents: false };
    }

    const tenantsHandle = Meteor.subscribe("tenants");
    const propertiesHandle = Meteor.subscribe("properties");
    const agentsHandle = Meteor.subscribe("agents");
    const applicationsHandle = Meteor.subscribe("rentalApplications");

    const tenantDoc = tenantsHandle.ready()
      ? Tenants.findOne({ ten_id: tenantId })
      : null;

    const relevantPropIds = new Set();

    if (tenantDoc?.prop_id) relevantPropIds.add(tenantDoc.prop_id);

    if (applicationsHandle.ready()) {
      RentalApplications.find({ ten_id: tenantId }).forEach((app) => {
        if (!app?.prop_id) return;
        const statusTokens = [app.status, app.landLordFinal, app.finalDecision]
          .filter(Boolean)
          .map((value) => value.toString().toLowerCase());
        const isApproved = statusTokens.some((token) =>
          APPROVED_TOKENS.has(token)
        );
        if (isApproved) relevantPropIds.add(app.prop_id);
      });
    }

    if (!propertiesHandle.ready() || relevantPropIds.size === 0) {
      const loading =
        !tenantsHandle.ready() ||
        !propertiesHandle.ready() ||
        !agentsHandle.ready() ||
        !applicationsHandle.ready();
      return { agentOptions: [], loadingAgents: loading };
    }

    const propertyDocs = Properties.find({
      prop_id: { $in: Array.from(relevantPropIds) },
    }).fetch();

    const agentInfoMap = new Map();

    propertyDocs.forEach((property) => {
      if (!property?.agent_id) return;
      const agentId = property.agent_id;
      const existing = agentInfoMap.get(agentId) || {
        agentId,
        agentName: "",
        agentEmail: "",
        properties: [],
      };
      existing.properties.push(property.prop_address || property.prop_id);
      agentInfoMap.set(agentId, existing);
    });

    if (agentsHandle.ready()) {
      agentInfoMap.forEach((info, agentId) => {
        const agentDoc = Agents.findOne({ agent_id: agentId });
        if (agentDoc) {
          const name = `${agentDoc.agent_fname || ""} ${agentDoc.agent_lname || ""}`
            .trim()
            .replace(/\s+/g, " ");
          info.agentName = name || info.agentName;
          info.agentEmail = agentDoc.agent_email || info.agentEmail;
        }
      });
    }

    const agentOptions = Array.from(agentInfoMap.values()).map((info) => ({
      agentId: info.agentId,
      agentName: info.agentName,
      agentEmail: info.agentEmail,
      properties: info.properties,
      label: buildAgentLabel(info),
    }));

    agentOptions.sort((a, b) => a.label.localeCompare(b.label));

    const loading =
      !tenantsHandle.ready() ||
      !propertiesHandle.ready() ||
      !agentsHandle.ready() ||
      !applicationsHandle.ready();

    return { agentOptions, loadingAgents: loading };
  }, [tenantId]);

  useEffect(() => {
    if (!selectedAgentId && agentOptions.length > 0) {
      setSelectedAgentId(agentOptions[0].agentId);
    }
  }, [agentOptions, selectedAgentId]);

  const { messages, loadingMessages } = useTracker(() => {
    if (!tenantId || !selectedAgentId) {
      return { messages: [], loadingMessages: false };
    }
    const sub = Meteor.subscribe("messages.byAgentTenant", selectedAgentId, tenantId);
    const fetched = Messages.find(
      { agent_id: selectedAgentId, tenant_id: tenantId },
      { sort: { createdAt: 1 } }
    ).fetch();
    return { messages: fetched, loadingMessages: !sub.ready() };
  }, [tenantId, selectedAgentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedAgentMeta = useMemo(() => {
    if (!selectedAgentId) return null;
    return agentOptions.find((opt) => opt.agentId === selectedAgentId) || null;
  }, [agentOptions, selectedAgentId]);

  const handleSend = () => {
    if (!newMessage.trim() || !tenantId || !selectedAgentId) return;
    Meteor.call("messages.insert", selectedAgentId, tenantId, newMessage, (err) => {
      if (err) alert(err.reason || err.message);
    });
    setNewMessage("");
  };

  if (!tenantId) {
    return (
      <div className="mt-10 bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
        <p className="text-sm text-red-600">
          You need to be signed in as a tenant to use the chat.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12 bg-white p-6 rounded-lg shadow-lg max-w-5xl mx-auto">
      <h3 className="text-2xl font-semibold text-gray-800 mb-3">
        Chat With Your Agent
      </h3>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Select Agent
        </label>
        <select
          value={selectedAgentId}
          onChange={(e) => setSelectedAgentId(e.target.value)}
          className="border rounded-md p-2 w-full"
          disabled={loadingAgents || agentOptions.length === 0}
        >
          <option value="">-- Choose an Agent --</option>
          {agentOptions.map((option) => (
            <option key={option.agentId} value={option.agentId}>
              {option.label}
            </option>
          ))}
        </select>
        {loadingAgents && (
          <p className="text-gray-500 text-sm mt-2">Loading your agents…</p>
        )}
        {agentOptions.length === 0 && !loadingAgents && (
          <p className="text-gray-500 text-sm mt-2">
            No agents linked to your leased properties yet.
          </p>
        )}
        {selectedAgentMeta && selectedAgentMeta.properties.length > 0 && (
          <p className="text-gray-500 text-xs mt-2">
            Properties: {selectedAgentMeta.properties.join(", ")}
          </p>
        )}
      </div>

      <div className="h-64 overflow-y-auto border rounded-md p-3 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-gray-500 italic text-sm text-center mt-6">
            No messages yet. Start the conversation!
          </p>
        )}
        {loadingMessages && (
          <p className="text-gray-500 italic text-sm text-center mt-2">
            Loading messages…
          </p>
        )}
        {messages.map((message) => {
          const isTenant = message.sender_id === tenantId;
          return (
            <div
              key={message._id}
              className={`my-2 flex ${isTenant ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-3 py-2 rounded-xl ${
                  isTenant ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                }`}
              >
                <p>{message.text}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-3 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow border rounded-l-md p-2 focus:outline-none"
          disabled={!selectedAgentId}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-r-md"
          disabled={!selectedAgentId}
        >
          Send
        </button>
      </div>
    </div>
  );
};
