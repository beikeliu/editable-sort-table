import {
  EditableProTable,
  ProCard,
  ProFormField,
} from "@ant-design/pro-components";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { DragOutlined } from "@ant-design/icons";

const defaultData = new Array(20).fill(1).map((_, index) => {
  return {
    id: (Date.now() + index).toString(),
    title: `活动名称${index}`,
    decs: "这个活动真好玩",
  };
});

const DragHandler = ({ id }) => {
  const { setNodeRef, listeners } = useSortable({ id });
  return (
    <DragOutlined
      ref={setNodeRef}
      {...listeners}
      style={{ cursor: "pointer" }}
    />
  );
};

const TableRow = ({ ...props }) => {
  const id = props["data-row-key"];
  const { isDragging, setNodeRef, transform, transition, attributes } =
    useSortable({ id });
  const rowStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return <tr {...props} ref={setNodeRef} style={rowStyle} {...attributes} />;
};

const App = () => {
  const [editableKeys, setEditableRowKeys] = useState(() =>
    defaultData.map((item) => item.id)
  );
  const [dataSource, setDataSource] = useState(() => defaultData);
  const columns = [
    {
      title: "活动名称",
      dataIndex: "title",
      width: "30%",
      formItemProps: {
        rules: [
          {
            required: true,
            whitespace: true,
            message: "此项是必填项",
          },
          {
            message: "必须包含数字",
            pattern: /[0-9]/,
          },
          {
            max: 16,
            whitespace: true,
            message: "最长为 16 位",
          },
          {
            min: 6,
            whitespace: true,
            message: "最小为 6 位",
          },
        ],
      },
    },
    {
      title: "状态",
      key: "state",
      dataIndex: "state",
      valueType: "select",
      valueEnum: {
        all: { text: "全部", status: "Default" },
        open: {
          text: "未解决",
          status: "Error",
        },
        closed: {
          text: "已解决",
          status: "Success",
        },
      },
    },
    {
      title: "描述",
      dataIndex: "decs",
    },
    {
      title: "操作",
      valueType: "option",
      width: 250,
      render: () => {
        return null;
      },
    },
  ];
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = dataSource.findIndex((item) => item.id === active.id);
      const newIndex = dataSource.findIndex((item) => item.id === over.id);
      const newData = arrayMove(dataSource, oldIndex, newIndex);
      setDataSource(newData);
    }
  };
  return (
    <>
      <DndContext
        sensors={useSensors(
          useSensor(PointerSensor),
          useSensor(KeyboardSensor)
        )}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={dataSource.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <EditableProTable
            headerTitle="可编辑表格"
            columns={columns}
            rowKey="id"
            scroll={{
              x: 960,
            }}
            value={dataSource}
            onChange={setDataSource}
            recordCreatorProps={{
              newRecordType: "dataSource",
              record: () => ({
                id: Date.now(),
              }),
            }}
            toolBarRender={null}
            editable={{
              type: "multiple",
              editableKeys,
              actionRender: (row, config, defaultDoms) => {
                return [
                  defaultDoms.delete,
                  <DragHandler key={"DragHandler"} id={row.id} />,
                ];
              },
              onValuesChange: (record, recordList) => {
                setDataSource(recordList);
              },
              onChange: setEditableRowKeys,
            }}
            components={{
              body: {
                row: TableRow,
              },
            }}
          />
        </SortableContext>
      </DndContext>
      <ProCard title="表格数据">
        <ProFormField
          ignoreFormItem
          fieldProps={{
            style: {
              width: "100%",
            },
          }}
          mode="read"
          valueType="jsonCode"
          text={JSON.stringify(dataSource)}
        />
      </ProCard>
    </>
  );
};
export default App;
