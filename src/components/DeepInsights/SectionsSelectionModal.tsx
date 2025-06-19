
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { List, FileText } from 'lucide-react';

interface Section {
  section_title: string;
  summary: string;
  pages: number[];
}

interface SectionsSelectionModalProps {
  dynamicSections: Section[];
  selectedFileIds: string[];
  onSectionSelection: (dynamicSections: any, fixedSections: string[]) => void;
}

const FIXED_SECTIONS = [
  'Volume Growth',
  'Logistic',
  'RMC VAC Plus',
  'TALUKA RANKING',
  'UBS-outlets',
  'Actual vs budgeted variable cost',
  'Progress of projects',
  'INDUSTRY GROWTH VIS-A-VIS UTCL',
  'REGION WISE MARKET SHARE',
  'SEGMENT-WISE GROWTH',
  'NCR',
  'TRADE NCR vs INSTITUTIONAL NCR',
  'Key Outstanding',
  'UBS Slide',
  'Sales performance trend',
  'VARIABLE COST',
  'Fuel Mix',
  'POWER HEAT CONSUMPTION vs Budget',
  'Fixed costs',
  'FINANCIALS',
  'OVERSEAS OPERATIONS',
  'Safety'
];

export const SectionsSelectionModal: React.FC<SectionsSelectionModalProps> = ({
  dynamicSections,
  selectedFileIds,
  onSectionSelection,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDynamicSections, setSelectedDynamicSections] = useState<{[key: string]: Section[]}>({});
  const [selectedFixedSections, setSelectedFixedSections] = useState<string[]>([]);

  useEffect(() => {
    // Reset selections when files change
    setSelectedDynamicSections({});
    setSelectedFixedSections([]);
  }, [selectedFileIds]);

  const handleDynamicSectionToggle = (fileId: string, section: Section, checked: boolean) => {
    setSelectedDynamicSections(prev => {
      const newSelections = { ...prev };
      if (!newSelections[fileId]) {
        newSelections[fileId] = [];
      }
      
      if (checked) {
        newSelections[fileId] = [...newSelections[fileId], section];
      } else {
        newSelections[fileId] = newSelections[fileId].filter(s => s.section_title !== section.section_title);
        if (newSelections[fileId].length === 0) {
          delete newSelections[fileId];
        }
      }
      
      return newSelections;
    });
  };

  const handleFixedSectionToggle = (section: string, checked: boolean) => {
    setSelectedFixedSections(prev => {
      if (checked) {
        return [...prev, section];
      } else {
        return prev.filter(s => s !== section);
      }
    });
  };

  const handleApplySelection = () => {
    // Transform dynamic sections to match the required format
    const dynamicSectionList: {[key: string]: {section_title: string, pages: number[]}[]} = {};
    
    Object.entries(selectedDynamicSections).forEach(([fileId, sections]) => {
      dynamicSectionList[fileId] = sections.map(section => ({
        section_title: section.section_title,
        pages: section.pages
      }));
    });

    onSectionSelection(dynamicSectionList, selectedFixedSections);
    setIsOpen(false);
  };

  const isDynamicSectionSelected = (fileId: string, section: Section) => {
    return selectedDynamicSections[fileId]?.some(s => s.section_title === section.section_title) || false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-2 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          disabled={selectedFileIds.length === 0}
        >
          <List className="h-3 w-3 mr-1" />
          Select Sections
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-white">Select Sections for Summary</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Dynamic Sections */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Dynamic Sections</h4>
            <ScrollArea className="h-48 border border-gray-700 rounded-lg p-3">
              {dynamicSections.length === 0 ? (
                <div className="text-gray-400 text-center py-4 text-sm">
                  No dynamic sections available
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedFileIds.map(fileId => {
                    const sectionsForFile = dynamicSections.filter((_, index) => 
                      selectedFileIds.indexOf(fileId) === Math.floor(index / (dynamicSections.length / selectedFileIds.length))
                    );
                    
                    return sectionsForFile.map((section, index) => (
                      <div key={`${fileId}-${index}`} className="flex items-start gap-2">
                        <Checkbox
                          checked={isDynamicSectionSelected(fileId, section)}
                          onCheckedChange={(checked) => 
                            handleDynamicSectionToggle(fileId, section, checked as boolean)
                          }
                          className="mt-1 border-grey bg-gray-700"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-1 mb-1">
                            <FileText className="h-3 w-3 text-blue-400" />
                            <span className="text-sm font-medium">{section.section_title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>Pages: {section.pages.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    ));
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Fixed Sections */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Fixed Sections</h4>
            <div className="border border-gray-700 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-2">
                {FIXED_SECTIONS.map((section) => (
                  <div key={section} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedFixedSections.includes(section)}
                      onCheckedChange={(checked) => 
                        handleFixedSectionToggle(section, checked as boolean)
                      }
                      className="mt-1 border-grey bg-gray-700"
                    />
                    <span className="text-sm">{section}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleApplySelection}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Apply Selection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
