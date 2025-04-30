/**
 * Pagination Component
 * A reusable pagination component that displays page numbers and navigation controls
 * @param {Object} props - Component props
 * @param {number} props.currentPage - Current active page number
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Callback function when page changes
 * @returns {JSX.Element|null} Rendered component or null if only one page
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page
  }

  /**
   * Renders the page number buttons with ellipsis for large page counts
   * @returns {Array<JSX.Element>} Array of page number buttons
   */
  const renderPageNumbers = () => {
    const pages = [];
    
    // Always show first page
    pages.push(
      <TouchableOpacity
        key={1}
        style={[
          styles.pageButton,
          currentPage === 1 ? styles.activeButton : styles.inactiveButton
        ]}
        onPress={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        <Text
          style={[
            styles.buttonText,
            currentPage === 1 ? styles.activeButtonText : styles.inactiveButtonText
          ]}
        >
          1
        </Text>
      </TouchableOpacity>
    );

    // Add ellipsis and middle page numbers
    if (totalPages > 5) {
      let startPage, endPage;
      if (currentPage <= 3) {
        startPage = 2;
        endPage = 5;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 4;
        endPage = totalPages - 1;
      } else {
        startPage = currentPage - 1;
        endPage = currentPage + 1;
      }

      if (startPage > 2) {
        pages.push(
          <View key="ellipsis-1" style={[styles.pageButton, styles.inactiveButton]}>
            <Text style={[styles.buttonText, styles.inactiveButtonText]}>...</Text>
          </View>
        );
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <TouchableOpacity
            key={i}
            style={[
              styles.pageButton,
              currentPage === i ? styles.activeButton : styles.inactiveButton
            ]}
            onPress={() => onPageChange(i)}
            disabled={currentPage === i}
          >
            <Text
              style={[
                styles.buttonText,
                currentPage === i ? styles.activeButtonText : styles.inactiveButtonText
              ]}
            >
              {i}
            </Text>
          </TouchableOpacity>
        );
      }

      if (endPage < totalPages - 1) {
        pages.push(
          <View key="ellipsis-2" style={[styles.pageButton, styles.inactiveButton]}>
            <Text style={[styles.buttonText, styles.inactiveButtonText]}>...</Text>
          </View>
        );
      }
    } else {
      // Show all page numbers when total pages is less than 5
      for (let i = 2; i < totalPages; i++) {
        pages.push(
          <TouchableOpacity
            key={i}
            style={[
              styles.pageButton,
              currentPage === i ? styles.activeButton : styles.inactiveButton
            ]}
            onPress={() => onPageChange(i)}
            disabled={currentPage === i}
          >
            <Text
              style={[
                styles.buttonText,
                currentPage === i ? styles.activeButtonText : styles.inactiveButtonText
              ]}
            >
              {i}
            </Text>
          </TouchableOpacity>
        );
      }
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(
        <TouchableOpacity
          key={totalPages}
          style={[
            styles.pageButton,
            currentPage === totalPages ? styles.activeButton : styles.inactiveButton
          ]}
          onPress={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <Text
            style={[
              styles.buttonText,
              currentPage === totalPages ? styles.activeButtonText : styles.inactiveButtonText
            ]}
          >
            {totalPages}
          </Text>
        </TouchableOpacity>
      );
    }

    return pages;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageInfo}>
        Page {currentPage} of {totalPages}
      </Text>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[
            styles.arrowButton,
            currentPage === 1 ? styles.disabledButton : styles.enabledButton
          ]}
          onPress={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={currentPage === 1 ? '#ccc' : '#1F2B40'}
          />
        </TouchableOpacity>

        {renderPageNumbers()}

        <TouchableOpacity
          style={[
            styles.arrowButton,
            currentPage === totalPages ? styles.disabledButton : styles.enabledButton
          ]}
          onPress={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={currentPage === totalPages ? '#ccc' : '#1F2B40'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  pageInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  pageButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeButton: {
    backgroundColor: '#FFC107',
  },
  inactiveButton: {
    backgroundColor: '#F5F7FA',
  },
  disabledButton: {
    opacity: 0.5,
  },
  enabledButton: {
    opacity: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeButtonText: {
    color: '#1F2B40',
  },
  inactiveButtonText: {
    color: '#666',
  },
});

export default Pagination; 