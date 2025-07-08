'use client';

import { useState, useEffect } from 'react';

interface ActiveUser {
  id: string;
  username: string;
}

interface ActiveUsersSidebarProps {
  activeUsers: ActiveUser[];
  currentUserId: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ActiveUsersSidebar({
  activeUsers,
  currentUserId,
  isOpen,
  onToggle
}: ActiveUsersSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full bg-white shadow-lg border-l border-gray-200 
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        w-80 lg:w-64
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Active Users</h2>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{activeUsers.length} online</span>
            </div>
          </div>

          <div className="space-y-2">
            {activeUsers.length === 0 ? (
              <p className="text-gray-500 text-sm">No active users</p>
            ) : (
              activeUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    user.id === currentUserId
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      user.id === currentUserId
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-700'
                    }`}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      user.id === currentUserId
                        ? 'text-blue-900'
                        : 'text-gray-900'
                    }`}>
                      {user.username}
                      {user.id === currentUserId && (
                        <span className="ml-2 text-xs text-blue-600">(You)</span>
                      )}
                    </p>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-500">Online</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
} 