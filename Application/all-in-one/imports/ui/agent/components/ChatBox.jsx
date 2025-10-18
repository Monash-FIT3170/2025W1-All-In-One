import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import {
  Messages,
  Tenants,
  Properties,
  Agents,
  Tickets,
  RentalApplications,
} from "../../../api/database/collections";

export const ChatBox = ({ agentId: agentIdProp }) => {
  const [tenantId, setTenantId] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const {
    agentId,
    tenants,
    tenantsLoading,
    propertyAgentMap,
    tenantAgentOverride,
  } = useTracker(() => {
    const currentAgentId = agentIdProp ?? Meteor.userId();
    if (!currentAgentId) {
      return {
        agentId: null,
        tenants: [],
        propertyAgentMap: new Map(),
        tenantAgentOverride: new Map(),
        tenantsLoading: false,
      };
    }

    const agentsHandle = Meteor.subscribe("agents");
    const propertiesHandle = Meteor.subscribe("properties");
    const tenantsHandle = Meteor.subscribe("tenants");
    const ticketsHandle = Meteor.subscribe("tickets");
    const appsHandle = Meteor.subscribe("rentalApplications");

    const user = Meteor.user();
    const email = user?.emails?.[0]?.address;
    const loweredEmail = email?.toLowerCase();
    const profileFirst = user?.profile?.firstName?.toLowerCase();
    const profileLast = user?.profile?.lastName?.toLowerCase();

    const candidateIds = new Set([currentAgentId]);
    if (agentsHandle.ready()) {
      Agents.find({}, { fields: { agent_id: 1, agent_email: 1, agent_fname: 1, agent_lname: 1 } }).forEach(
        (doc) => {
          if (!doc) return;
          const matchesById = doc.agent_id === currentAgentId;
          const matchesByEmail =
            loweredEmail && typeof doc.agent_email === "string"
              ? doc.agent_email.toLowerCase() === loweredEmail
              : false;
          const matchesByName =
            profileFirst &&
            profileLast &&
            typeof doc.agent_fname === "string" &&
            typeof doc.agent_lname === "string" &&
            doc.agent_fname.toLowerCase() === profileFirst &&
            doc.agent_lname.toLowerCase() === profileLast;

          if ((matchesById || matchesByEmail || matchesByName) && doc.agent_id) {
            candidateIds.add(doc.agent_id);
          }
        }
      );
    }

    const candidateList = Array.from(candidateIds).filter(Boolean);

    const propertyAgentMap = new Map();
    const propertyIdsForAgent = new Set();
    if (propertiesHandle.ready()) {
      Properties.find({}, { fields: { prop_id: 1, agent_id: 1 } }).forEach((prop) => {
        if (!prop) return;
        const agentValue = prop.agent_id;
        if (prop.prop_id) {
          propertyAgentMap.set(prop.prop_id, agentValue);
          if (agentValue && candidateIds.has(agentValue)) {
            propertyIdsForAgent.add(prop.prop_id);
          }
        }
        if (prop._id) {
          propertyAgentMap.set(prop._id, agentValue);
          if (agentValue && candidateIds.has(agentValue)) {
            propertyIdsForAgent.add(prop._id);
          }
        }
      });
    }

    const tenantMap = new Map();
    if (tenantsHandle.ready()) {
      Tenants.find({}, { sort: { ten_fn: 1, ten_ln: 1 } }).forEach((tenant) => {
        if (!tenant?.ten_id) return;
        const propKey = tenant.prop_id;
        if (!propKey) return;
        const agentForProp = propertyAgentMap.get(propKey);
        if (agentForProp && candidateIds.has(agentForProp)) {
          tenantMap.set(tenant.ten_id, tenant);
          propertyIdsForAgent.add(propKey);
        }
      });
    }

    const tenantAgentOverride = new Map();
    const extraTenantIds = new Set();

    if (ticketsHandle.ready() && candidateList.length > 0) {
      Tickets.find(
        { agent_id: { $in: candidateList } },
        { fields: { ten_id: 1, prop_id: 1, agent_id: 1 } }
      ).forEach((ticket) => {
        if (!ticket) return;
        if (ticket.prop_id) {
          propertyIdsForAgent.add(ticket.prop_id);
          if (!propertyAgentMap.has(ticket.prop_id) && ticket.agent_id) {
            propertyAgentMap.set(ticket.prop_id, ticket.agent_id);
          }
        }
        if (ticket.ten_id) {
          extraTenantIds.add(ticket.ten_id);
          if (ticket.agent_id) tenantAgentOverride.set(ticket.ten_id, ticket.agent_id);
        }
      });
    }

    if (appsHandle.ready() && propertyIdsForAgent.size > 0) {
      const approvedTokens = new Set(["approved", "accepted"]);
      RentalApplications.find(
        { prop_id: { $in: Array.from(propertyIdsForAgent) } },
        { fields: { prop_id: 1, ten_id: 1, status: 1, landLordFinal: 1, finalDecision: 1 } }
      ).forEach((app) => {
        if (!app?.ten_id) return;
        const agentForProp = propertyAgentMap.get(app.prop_id);
        if (!agentForProp || !candidateIds.has(agentForProp)) return;

        tenantAgentOverride.set(app.ten_id, agentForProp);

        const statusTokens = [app.status, app.landLordFinal, app.finalDecision]
          .filter(Boolean)
          .map((value) => value.toString().toLowerCase());

        const isApproved = statusTokens.some((token) => approvedTokens.has(token));
        if (isApproved) {
          extraTenantIds.add(app.ten_id);
        }
      });
    }

    if (extraTenantIds.size > 0 && tenantsHandle.ready()) {
      Tenants.find(
        { ten_id: { $in: Array.from(extraTenantIds) } },
        { sort: { ten_fn: 1, ten_ln: 1 } }
      ).forEach((tenant) => {
        if (tenant?.ten_id) {
          tenantMap.set(tenant.ten_id, tenant);
        }
      });
    }

    const tenantsArray = Array.from(tenantMap.values()).sort((a, b) => {
      const aName = `${a?.ten_fn || ""} ${a?.ten_ln || ""}`.trim().toLowerCase();
      const bName = `${b?.ten_fn || ""} ${b?.ten_ln || ""}`.trim().toLowerCase();
      return aName.localeCompare(bName);
    });

    const tenantsLoading =
      !propertiesHandle.ready() || !tenantsHandle.ready() || !agentsHandle.ready();

    return {
      agentId: currentAgentId,
      tenants: tenantsArray,
      propertyAgentMap,
      tenantAgentOverride,
      tenantsLoading,
    };
  }, [agentIdProp]);

  const resolvedAgentForTenant = useMemo(() => {
    if (!tenantId) return null;
    const tenant = tenants.find((t) => t.ten_id === tenantId);
    if (!tenant) return null;
    return (
      propertyAgentMap.get(tenant.prop_id) ||
      tenantAgentOverride?.get(tenant.ten_id) ||
      agentId ||
      null
    );
  }, [tenantId, tenants, propertyAgentMap, tenantAgentOverride, agentId]);

  const { messages, messagesLoading } = useTracker(() => {
    if (!tenantId || !resolvedAgentForTenant) return { messages: [], messagesLoading: false };
    const sub = Meteor.subscribe("messages.byAgentTenant", resolvedAgentForTenant, tenantId);
    const fetched = Messages.find(
      { agent_id: resolvedAgentForTenant, tenant_id: tenantId },
      { sort: { createdAt: 1 } }
    ).fetch();
    return { messages: fetched, messagesLoading: !sub.ready() };
  }, [resolvedAgentForTenant, tenantId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !tenantId || !resolvedAgentForTenant) return;
    Meteor.call("messages.insert", resolvedAgentForTenant, tenantId, newMessage, (err) => {
      if (err) alert(err.reason || err.message);
    });
    setNewMessage("");
  };

  return (
    <div className="mt-10 bg-white p-6 rounded-lg shadow-lg max-w-6xl mx-auto">
      <h3 className="text-2xl font-semibold text-gray-800 mb-3">Agent–Tenant Chat</h3>

      {!agentId && (
        <p className="text-sm text-red-600 mb-3">
          You need to be signed in as an agent to use the chat.
        </p>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Select Tenant
        </label>
        <select
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
          className="border rounded-md p-2 w-full"
          disabled={!agentId || tenantsLoading}
        >
          <option value="">-- Choose a Tenant --</option>
          {tenants.map((t) => (
            <option key={t._id || t.ten_id} value={t.ten_id}>
              {t.ten_fn} {t.ten_ln} ({t.ten_email})
            </option>
          ))}
        </select>
        {tenantsLoading && (
          <p className="text-gray-500 text-sm mt-2">Loading tenants…</p>
        )}
        {tenants.length === 0 && !tenantsLoading && (
          <p className="text-gray-500 text-sm mt-2">
            No tenants linked to your properties yet.
          </p>
        )}
      </div>

      <div className="h-64 overflow-y-auto border rounded-md p-3 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-gray-500 italic text-sm text-center mt-6">
            No messages yet. Start the conversation!
          </p>
        )}
        {messagesLoading && (
          <p className="text-gray-500 italic text-sm text-center mt-2">
            Loading messages…
          </p>
        )}
        {messages.map((m) => {
          const isMe = m.sender_id === Meteor.userId();
          return (
            <div key={m._id} className={`my-2 flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] px-3 py-2 rounded-xl ${
                  isMe ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                }`}
              >
                <p>{m.text}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {new Date(m.createdAt).toLocaleTimeString()}
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
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-r-md"
        >
          Send
        </button>
      </div>
    </div>
  );
};
